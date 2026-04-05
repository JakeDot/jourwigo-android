import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";

export interface AISettings {
  enabled: boolean;
  permissions: {
    chat: boolean;
    imageGen: boolean;
    mapsGrounding: boolean;
    imageAnalysis: boolean;
    audioSpeech: boolean;
    highThinking: boolean;
  };
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  enabled: false,
  permissions: {
    chat: true,
    imageGen: false,
    mapsGrounding: false,
    imageAnalysis: false,
    audioSpeech: false,
    highThinking: false,
  },
};

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async chat(message: string, history: any[] = [], settings: AISettings) {
    if (!settings.enabled || !settings.permissions.chat) {
      throw new Error("AI Chat is disabled in settings.");
    }

    const model = settings.permissions.highThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
    
    const response = await this.ai.models.generateContent({
      model,
      contents: [...history, { role: "user", parts: [{ text: message }] }],
      config: {
        systemInstruction: "You are a helpful AI assistant for Jourwigo, a Wherigo mobile client. Help users with geocaching, puzzle solving, and navigation.",
        thinkingConfig: settings.permissions.highThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        tools: settings.permissions.mapsGrounding ? [{ googleMaps: {} }] : undefined,
      },
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks,
    };
  }

  async generateImage(prompt: string, size: "1K" | "2K" | "4K", aspectRatio: string, settings: AISettings) {
    if (!settings.enabled || !settings.permissions.imageGen) {
      throw new Error("Image generation is disabled.");
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio as any,
        },
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
    }
    throw new Error("No image generated.");
  }

  async generateVideo(prompt: string, settings: AISettings) {
    if (!settings.enabled || !settings.permissions.imageGen) { // Using imageGen permission for video too
      throw new Error("Video generation is disabled.");
    }

    let operation = await this.ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await this.ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed.");

    // Fetch with API key header
    const response = await fetch(downloadLink, {
      method: 'GET',
      headers: {
        'x-goog-api-key': process.env.GEMINI_API_KEY || "",
      },
    });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async analyzeImage(base64Image: string, prompt: string, settings: AISettings) {
    if (!settings.enabled || !settings.permissions.imageAnalysis) {
      throw new Error("Image analysis is disabled.");
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image.split(',')[1], mimeType: "image/jpeg" } },
            { text: prompt }
          ]
        }
      ],
    });

    return response.text;
  }

  async textToSpeech(text: string, settings: AISettings) {
    if (!settings.enabled || !settings.permissions.audioSpeech) {
      throw new Error("Audio features are disabled.");
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
}

export const aiService = new AIService();
