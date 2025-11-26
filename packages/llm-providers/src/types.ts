import { z } from "zod";

/**
 * Unique identifier for each LLM provider
 */
export type ProviderId = "openai" | "anthropic" | "google" | "grok";

/**
 * Model identifier for each provider
 */
export interface ModelConfig {
  providerId: ProviderId;
  modelId: string;
  displayName: string;
  maxTokens: number;
  supportsStreaming: boolean;
}

/**
 * Message format for LLM requests
 */
export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Request format for LLM generation
 */
export const GenerationRequestSchema = z.object({
  messages: z.array(MessageSchema),
  maxTokens: z.number().optional().default(4096),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  topP: z.number().min(0).max(1).optional(),
  stream: z.boolean().optional().default(false),
});

export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;

/**
 * Response format from LLM generation
 */
export interface GenerationResponse {
  content: string;
  model: string;
  providerId: ProviderId;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

/**
 * Anonymized response for the critique phase
 */
export interface AnonymizedResponse {
  id: string; // e.g., "Response A", "Response B"
  content: string;
  // Deliberately excludes model/provider info
}

/**
 * Critique from a model evaluating responses
 */
export const CritiqueSchema = z.object({
  responseId: z.string(),
  rank: z.number().min(1),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  errors: z.array(z.string()),
  overallScore: z.number().min(0).max(100),
  reasoning: z.string(),
});

export type Critique = z.infer<typeof CritiqueSchema>;

/**
 * Full critique result from a single model
 */
export interface CritiqueResult {
  criticModelId: string;
  providerId: ProviderId;
  critiques: Critique[];
  latencyMs: number;
}

/**
 * Abstract interface for LLM providers
 */
export interface LLMProvider {
  readonly id: ProviderId;
  readonly name: string;
  readonly availableModels: ModelConfig[];

  /**
   * Generate a response from the model
   */
  generate(request: GenerationRequest, modelId?: string): Promise<GenerationResponse>;

  /**
   * Check if the provider is configured and available
   */
  isAvailable(): boolean;
}

/**
 * Configuration for initializing providers
 */
export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
}
