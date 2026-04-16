
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Chat } from "@google/genai";

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // IMPORTANT: The API key is sourced from environment variables.
    // Do not expose this in client-side code in a real application.
    // This is for demonstration purposes in the Applet environment.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  createChatSession(): Chat {
    return this.ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a helpful and creative assistant. You can help with a wide range of tasks, including generating marketing copy and brainstorming ideas.',
      },
    });
  }

  async generateImage(prompt: string, aspectRatio: AspectRatio): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: aspectRatio,
          },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
      } else {
        throw new Error('No image was generated. The prompt may have been blocked.');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during image generation.';
      throw new Error(`Failed to generate image: ${errorMessage}`);
    }
  }
}
