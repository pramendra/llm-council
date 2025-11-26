import Anthropic from "@anthropic-ai/sdk";
import type {
  LLMProvider,
  ProviderConfig,
  ModelConfig,
  GenerationRequest,
  GenerationResponse,
} from "../types";

const ANTHROPIC_MODELS: ModelConfig[] = [
  {
    providerId: "anthropic",
    modelId: "claude-sonnet-4-20250514",
    displayName: "Claude Sonnet 4",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "anthropic",
    modelId: "claude-opus-4-20250514",
    displayName: "Claude Opus 4",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "anthropic",
    modelId: "claude-3-7-sonnet-20250219",
    displayName: "Claude 3.7 Sonnet",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "anthropic",
    modelId: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    maxTokens: 200000,
    supportsStreaming: true,
  },
  {
    providerId: "anthropic",
    modelId: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    maxTokens: 200000,
    supportsStreaming: true,
  },
];

export class AnthropicProvider implements LLMProvider {
  readonly id = "anthropic" as const;
  readonly name = "Anthropic";
  readonly availableModels = ANTHROPIC_MODELS;

  private client: Anthropic | null = null;
  private defaultModel: string;

  constructor(config: ProviderConfig = {}) {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    this.defaultModel = config.defaultModel || "claude-sonnet-4-20250514";

    if (apiKey) {
      this.client = new Anthropic({
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
      throw new Error("Anthropic provider not configured. Set ANTHROPIC_API_KEY.");
    }

    const model = modelId || this.defaultModel;
    const startTime = performance.now();

    // Extract system message if present
    const systemMessage = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await this.client.messages.create({
      model,
      max_tokens: request.maxTokens || 4096,
      system: systemMessage?.content,
      messages: otherMessages,
    });

    const latencyMs = performance.now() - startTime;
    const textContent = response.content.find((c) => c.type === "text");

    return {
      content: textContent?.type === "text" ? textContent.text : "",
      model,
      providerId: this.id,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      latencyMs,
    };
  }
}
