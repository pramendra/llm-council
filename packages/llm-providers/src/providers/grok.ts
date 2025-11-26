import OpenAI from "openai";
import type {
  LLMProvider,
  ProviderConfig,
  ModelConfig,
  GenerationRequest,
  GenerationResponse,
} from "../types";

const GROK_MODELS: ModelConfig[] = [
  {
    providerId: "grok",
    modelId: "grok-3",
    displayName: "Grok 3",
    maxTokens: 131072,
    supportsStreaming: true,
  },
  {
    providerId: "grok",
    modelId: "grok-3-mini",
    displayName: "Grok 3 Mini",
    maxTokens: 131072,
    supportsStreaming: true,
  },
  {
    providerId: "grok",
    modelId: "grok-2",
    displayName: "Grok 2",
    maxTokens: 131072,
    supportsStreaming: true,
  },
];

/**
 * Grok provider using xAI API (OpenAI-compatible)
 */
export class GrokProvider implements LLMProvider {
  readonly id = "grok" as const;
  readonly name = "xAI Grok";
  readonly availableModels = GROK_MODELS;

  private client: OpenAI | null = null;
  private defaultModel: string;

  constructor(config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.GROK_API_KEY;
    this.defaultModel = config.defaultModel || "grok-3";

    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl || "https://api.x.ai/v1",
      });
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
      throw new Error("Grok provider not configured. Set GROK_API_KEY.");
    }

    const model = modelId || this.defaultModel;
    const startTime = performance.now();

    const response = await this.client.chat.completions.create({
      model,
      messages: request.messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      top_p: request.topP,
    });

    const latencyMs = performance.now() - startTime;
    const choice = response.choices[0];

    return {
      content: choice?.message?.content || "",
      model,
      providerId: this.id,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      latencyMs,
    };
  }
}
