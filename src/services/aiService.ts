import { AIModelTier, GroundingSource } from '../types';

export interface ChatApiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ChatApiResponse {
  text: string;
  modelUsed: string;
  sources?: GroundingSource[];
  searchQueries?: string[];
}

export interface SearchApiResponse {
  text: string;
  sources: GroundingSource[];
  searchQueries: string[];
}

export interface GeneratedPlanRecommendation {
  subject: string;
  duration: number;
  notes?: string;
}

export const AIService = {
  async sendChatMessage(params: {
    messages: ChatApiMessage[];
    systemInstruction: string;
    modelTier: AIModelTier;
    useSearchGrounding: boolean;
  }): Promise<ChatApiResponse> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: params.messages,
        systemInstruction: params.systemInstruction,
        model: params.modelTier,
        useSearchGrounding: params.useSearchGrounding,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `AI Chat request failed with status ${res.status}`);
    }

    return await res.json();
  },

  async querySearchGrounding(query: string, subjectContext?: string): Promise<SearchApiResponse> {
    const res = await fetch('/api/ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        subjectContext,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Search Grounding request failed with status ${res.status}`);
    }

    return await res.json();
  },

  async generatePlanSuggestions(
    topic: string,
    category: string
  ): Promise<GeneratedPlanRecommendation[]> {
    const res = await fetch('/api/ai/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        category,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Plan generation failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.plans || [];
  },
};
