import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  LLMProvider,
  ProviderConfig,
  ModelConfig,
  GenerationRequest,
  GenerationResponse,
  Message,
} from "../types";

const GOOGLE_MODELS: ModelConfig[] = [
  {
    providerId: "google",
    modelId: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    maxTokens: 1048576,
    supportsStreaming: true,
  },
  {
    providerId: "google",
    modelId: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    maxTokens: 1048576,
    supportsStreaming: true,
  },
  {
    providerId: "google",
    modelId: "gemini-2.0-flash",
    displayName: "Gemini 2.0 Flash",
    maxTokens: 1048576,
    supportsStreaming: true,
  },
  {
    providerId: "google",
    modelId: "gemini-2.0-flash-lite",
    displayName: "Gemini 2.0 Flash Lite",
    maxTokens: 1048576,
    supportsStreaming: true,
  },
];

export class GoogleProvider implements LLMProvider {
  readonly id = "google" as const;
  readonly name = "Google";
  readonly availableModels = GOOGLE_MODELS;

  private client: GoogleGenerativeAI | null = null;
  private defaultModel: string;

  constructor(config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.GOOGLE_AI_KEY;
    this.defaultModel = config.defaultModel || "gemini-2.5-flash";

    if (apiKey) {
      this.client = new GoogleGenerativeAI(apiKey);
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generate(
    request: GenerationRequest,
    modelId?: string
  ): Promise<GenerationResponse> {
    if (!this.client) {
      throw new Error("Google provider not configured. Set GOOGLE_AI_KEY.");
    }

    const model = modelId || this.defaultModel;
    const startTime = performance.now();

    // Extract system message if present
    const systemMessage = request.messages.find((m: Message) => m.role === "system");
    const otherMessages = request.messages.filter((m: Message) => m.role !== "system");

    const generativeModel = this.client.getGenerativeModel({
      model,
      systemInstruction: systemMessage?.content,
    });

    // Convert messages to Gemini format
    const history = otherMessages.slice(0, -1).map((m: Message) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = otherMessages[otherMessages.length - 1];
    const chat = generativeModel.startChat({ history });

    const result = await chat.sendMessage(lastMessage?.content || "");
    const latencyMs = performance.now() - startTime;

    const response = result.response;
    const text = response.text();

    // Note: Gemini doesn't provide token counts in the same way
    return {
      content: text,
      model,
      providerId: this.id,
      usage: {
        promptTokens: 0, // Gemini doesn't provide this
        completionTokens: 0,
        totalTokens: 0,
      },
      latencyMs,
    };
  }
}
