import OpenAI from "openai";
import type {
  LLMProvider,
  ProviderConfig,
  ModelConfig,
  GenerationRequest,
  GenerationResponse,
} from "../types";

const OPENAI_MODELS: ModelConfig[] = [
  {
    providerId: "openai",
    modelId: "gpt-4.1",
    displayName: "GPT-4.1",
    maxTokens: 1047576,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    maxTokens: 1047576,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "gpt-4.1-nano",
    displayName: "GPT-4.1 Nano",
    maxTokens: 1047576,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "gpt-4o",
    displayName: "GPT-4o",
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "gpt-4o-mini",
    displayName: "GPT-4o Mini",
    maxTokens: 128000,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "o3",
    displayName: "o3",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "o4-mini",
    displayName: "o4 Mini",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "o3-mini",
    displayName: "o3 Mini",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "openai",
    modelId: "o1",
    displayName: "o1",
    maxTokens: 200000,
    supportsStreaming: false,
  },
];

export class OpenAIProvider implements LLMProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI";
  readonly availableModels = OPENAI_MODELS;

  private client: OpenAI | null = null;
  private defaultModel: string;

  constructor(config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.defaultModel = config.defaultModel || "gpt-4.1";

    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: config.baseUrl,
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
      throw new Error("OpenAI provider not configured. Set OPENAI_API_KEY.");
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
