import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini API as specified in gemini-api skill
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatMessagePart {
  text?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

// Endpoint: Multi-turn Chat with role system instructions and model options
app.post('/api/ai/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.5-flash',
      useSearchGrounding = false,
    } = req.body as {
      messages: ChatMessage[];
      systemInstruction?: string;
      model?: string;
      useSearchGrounding?: boolean;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    // Determine target model
    let targetModel = model;
    if (useSearchGrounding) {
      // Must use gemini-3.5-flash with googleSearch tool as specified in prompt
      targetModel = 'gemini-3.5-flash';
    } else if (model === 'fast') {
      targetModel = 'gemini-3.1-flash-lite';
    } else if (model === 'complex') {
      targetModel = 'gemini-3.1-pro-preview';
    } else if (!targetModel || targetModel === 'general') {
      targetModel = 'gemini-3.5-flash';
    }

    const config: Record<string, unknown> = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    // Format contents according to @google/genai
    const contents = messages.map((m) => ({
      role: m.role,
      parts: m.parts.map((p) => ({ text: p.text || '' })),
    }));

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config,
    });

    const replyText = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    const sources =
      groundingMetadata?.groundingChunks
        ?.map((chunk: { web?: { uri?: string; title?: string } }) => ({
          title: chunk.web?.title || 'Web Reference',
          url: chunk.web?.uri || '',
        }))
        .filter((src: { url: string }) => !!src.url) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      text: replyText,
      modelUsed: targetModel,
      sources,
      searchQueries,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/chat:', error);
    const errObj = error as { message?: string; status?: number };
    res.status(500).json({
      error: errObj.message || 'An error occurred while generating content with Gemini.',
    });
  }
});

// Endpoint: Direct Search Grounding query using gemini-3.5-flash
app.post('/api/ai/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, subjectContext } = req.body as { query: string; subjectContext?: string };

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query string is required' });
      return;
    }

    const systemPrompt = `You are a high-level Computer Science research advisor and tutor with access to real-time Google Search data.
Provide comprehensive, factual, up-to-date answers for student inquiries, algorithms, papers, benchmarks, curriculum specs, and programming topics.
${subjectContext ? `Academic focus area: ${subjectContext}` : ''}
Structure your response with clear headings, bullet points, key takeaways, and relevant examples or code snippets when helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        systemInstruction: systemPrompt,
        tools: [{ googleSearch: {} }],
      },
    });

    const replyText = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    const sources =
      groundingMetadata?.groundingChunks
        ?.map((chunk: { web?: { uri?: string; title?: string } }) => ({
          title: chunk.web?.title || 'Reference',
          url: chunk.web?.uri || '',
        }))
        .filter((src: { url: string }) => !!src.url) || [];

    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      text: replyText,
      sources,
      searchQueries,
    });
  } catch (error: unknown) {
    console.error('Error in /api/ai/search:', error);
    const errObj = error as { message?: string };
    res.status(500).json({
      error: errObj.message || 'Failed to search Google data with Gemini.',
    });
  }
});

// Endpoint: Generate intelligent study recommendations & timetable plans
app.post('/api/ai/generate-plan', async (req: Request, res: Response): Promise<void> => {
  try {
    const { topic, category, targetHours, existingPlanCount } = req.body as {
      topic: string;
      category: string;
      targetHours?: number;
      existingPlanCount?: number;
    };

    const prompt = `Generate 3 structured study session plans for a Computer Science student studying "${topic}" under the category "${category}".
Return a strictly formatted JSON array of session objects.
Each session must have:
- subject: A crisp, action-oriented topic title (e.g. "Graph Theory: Dijkstra & Bellman-Ford Shortest Path Proofs")
- duration: Duration in minutes (choose 30, 45, 60, 90, or 120)
- notes: Specific objectives, theorems to prove, or LeetCode problem recommendations (1-2 sentences).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let plansData = [];
    try {
      plansData = JSON.parse(text);
    } catch {
      plansData = [];
    }

    res.json({ plans: plansData });
  } catch (error: unknown) {
    console.error('Error in /api/ai/generate-plan:', error);
    const errObj = error as { message?: string };
    res.status(500).json({
      error: errObj.message || 'Failed to generate study plan.',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Study Plan Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
