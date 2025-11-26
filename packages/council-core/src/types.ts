import { z } from "zod";
import type { ProviderId, GenerationResponse, Critique } from "@council/llm-providers";

/**
 * Configuration for the Council
 */
export interface CouncilConfig {
  /** Provider IDs to include in the council */
  workerProviders: ProviderId[];
  /** Provider ID to use as chairman for synthesis */
  chairmanProvider: ProviderId;
  /** Model ID for the chairman (optional, uses default) */
  chairmanModel?: string;
  /** Maximum tokens for responses */
  maxTokens?: number;
  /** Temperature for generation */
  temperature?: number;
  /** Whether to include debug information */
  debug?: boolean;
}

/**
 * A worker's response before anonymization
 */
export interface WorkerResponse {
  providerId: ProviderId;
  modelId: string;
  response: GenerationResponse;
}

/**
 * An anonymized response for critique phase
 */
export interface AnonymizedResponse {
  id: string; // e.g., "Response A", "Response B"
  content: string;
  // Source info hidden during critique phase
  _sourceProviderId?: ProviderId;
  _sourceModelId?: string;
}

/**
 * A critique from one model evaluating all responses
 */
export interface ModelCritique {
  criticProviderId: ProviderId;
  criticModelId: string;
  critiques: Critique[];
  latencyMs: number;
}

/**
 * Aggregated critique data for a single response
 */
export interface AggregatedCritique {
  responseId: string;
  providerId: ProviderId;
  modelId: string;
  content: string;
  averageRank: number;
  averageScore: number;
  allStrengths: string[];
  allWeaknesses: string[];
  allErrors: string[];
  votes: number;
}

/**
 * The final synthesized result
 */
export interface CouncilResult {
  /** The final synthesized response */
  finalResponse: string;
  /** The chairman model used */
  chairmanModel: string;
  /** All worker responses (revealed after synthesis) */
  workerResponses: WorkerResponse[];
  /** All critiques from the critique round */
  critiques: ModelCritique[];
  /** Aggregated critique data */
  aggregatedCritiques: AggregatedCritique[];
  /** Total latency in milliseconds */
  totalLatencyMs: number;
  /** Debug information if enabled */
  debug?: {
    phase1_fanout_ms: number;
    phase2_generation_ms: number;
    phase3_anonymize_ms: number;
    phase4_critique_ms: number;
    phase5_synthesis_ms: number;
  };
}

/**
 * Request schema for council query
 */
export const CouncilQuerySchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  config: z.object({
    workerProviders: z.array(z.enum(["openai", "anthropic", "google", "grok"])).optional(),
    chairmanProvider: z.enum(["openai", "anthropic", "google", "grok"]).optional(),
    chairmanModel: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
    debug: z.boolean().optional(),
  }).optional(),
});

export type CouncilQuery = z.infer<typeof CouncilQuerySchema>;

/**
 * System prompts for different phases
 */
export const SYSTEM_PROMPTS = {
  /**
   * Prompt for the critique phase
   */
  critique: `You are an expert evaluator tasked with critically analyzing multiple AI-generated responses.

For each response, you must:
1. Assign a rank (1 = best, higher = worse)
2. Identify specific strengths
3. Identify specific weaknesses
4. Flag any factual errors or logical mistakes
5. Give an overall score from 0-100
6. Provide brief reasoning for your evaluation

Be rigorous and objective. Focus on:
- Accuracy of information
- Clarity of explanation
- Completeness of answer
- Logical coherence
- Practical usefulness

You will receive multiple responses labeled as "Response A", "Response B", etc.
You do NOT know which model produced which response - evaluate purely on merit.

Return your evaluation as a JSON array of critiques.`,

  /**
   * Prompt for the chairman synthesis phase
   */
  synthesis: `You are the Chairman of an AI council. Your task is to synthesize the best possible answer from multiple AI responses and their peer critiques.

You have access to:
1. The original user question
2. Multiple AI-generated responses
3. Critiques from each AI evaluating all responses

Your job:
1. Review all responses and critiques
2. Identify the strongest reasoning and most accurate information
3. Correct any errors that were flagged by the critics
4. Synthesize a final answer that combines the best elements

Guidelines:
- Do NOT simply pick one response - synthesize the best parts
- If critics agree on an error, definitely correct it
- If critics disagree, use your judgment based on evidence
- The final answer should be better than any individual response
- Be clear, accurate, and complete

Provide ONLY the final synthesized answer, without meta-commentary about the process.`,
} as const;
