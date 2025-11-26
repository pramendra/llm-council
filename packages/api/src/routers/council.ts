import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../index";
import { ProviderRegistry } from "@council/llm-providers";
import { Council, CouncilQuerySchema } from "@council/council-core";

// Debug: Log environment variables at startup
console.log("🔑 Environment check:");
console.log("  OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing");
console.log("  ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ Missing");
console.log("  GOOGLE_AI_KEY:", process.env.GOOGLE_AI_KEY ? "✅ Set" : "❌ Missing");
console.log("  GROK_API_KEY:", process.env.GROK_API_KEY ? "✅ Set" : "❌ Missing");

// Initialize provider registry (uses env vars)
const registry = new ProviderRegistry();
console.log("📦 Available providers:", registry.getAvailableProviderIds());

export const councilRouter = router({
  /**
   * Get available providers
   */
  getProviders: publicProcedure.query(() => {
    return {
      available: registry.getAvailableProviderIds(),
      count: registry.count,
    };
  }),

  /**
   * Execute a council query
   */
  query: publicProcedure
    .input(CouncilQuerySchema)
    .mutation(async ({ input }) => {
      const council = new Council(registry, input.config);
      const result = await council.query(input.prompt, input.systemPrompt);

      return {
        finalResponse: result.finalResponse,
        chairmanModel: result.chairmanModel,
        totalLatencyMs: result.totalLatencyMs,
        workerCount: result.workerResponses.length,
        critiqueCount: result.critiques.length,
        aggregatedCritiques: result.aggregatedCritiques.map((c) => ({
          responseId: c.responseId,
          providerId: c.providerId,
          modelId: c.modelId,
          averageRank: c.averageRank,
          averageScore: c.averageScore,
          votes: c.votes,
        })),
        debug: result.debug,
      };
    }),

  /**
   * Execute a council query with full details (protected)
   */
  queryWithDetails: protectedProcedure
    .input(CouncilQuerySchema)
    .mutation(async ({ input }) => {
      const council = new Council(registry, {
        ...input.config,
        debug: true,
      });
      const result = await council.query(input.prompt, input.systemPrompt);

      return result;
    }),

  /**
   * Quick query with single model (for comparison)
   */
  singleModelQuery: publicProcedure
    .input(
      z.object({
        prompt: z.string(),
        systemPrompt: z.string().optional(),
        providerId: z.enum(["openai", "anthropic", "google", "grok"]),
        modelId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const provider = registry.getProvider(input.providerId);
      if (!provider) {
        throw new Error(`Provider ${input.providerId} not available`);
      }

      const messages: Array<{ role: "system" | "user"; content: string }> = [];
      if (input.systemPrompt) {
        messages.push({ role: "system", content: input.systemPrompt });
      }
      messages.push({ role: "user", content: input.prompt });

      const response = await provider.generate(
        { messages, maxTokens: 4096, temperature: 0.7 },
        input.modelId
      );

      return {
        content: response.content,
        model: response.model,
        providerId: response.providerId,
        latencyMs: response.latencyMs,
        usage: response.usage,
      };
    }),
});
