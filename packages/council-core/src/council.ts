import {
  type ProviderRegistry,
  type GenerationRequest,
  type Critique,
  type ProviderId,
  CritiqueSchema,
} from "@council/llm-providers";
import {
  type CouncilConfig,
  type WorkerResponse,
  type AnonymizedResponse,
  type ModelCritique,
  type AggregatedCritique,
  type CouncilResult,
  SYSTEM_PROMPTS,
} from "./types";
import {
  anonymizeResponses,
  shuffleArray,
  formatResponsesForCritique,
  formatForSynthesis,
  calculateCritiqueStats,
} from "./utils";

/**
 * Default council configuration - using only OpenAI and Google
 */
const DEFAULT_CONFIG: CouncilConfig = {
  workerProviders: ["openai", "google"],
  chairmanProvider: "openai",
  maxTokens: 4096,
  temperature: 0.7,
  debug: true,
};

/**
 * The Council orchestrates the multi-model ensemble process
 */
export class Council {
  private registry: ProviderRegistry;
  private config: CouncilConfig;

  constructor(registry: ProviderRegistry, config?: Partial<CouncilConfig>) {
    this.registry = registry;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute the full council process for a query
   */
  async query(prompt: string, systemPrompt?: string): Promise<CouncilResult> {
    const startTime = performance.now();
    const debug: CouncilResult["debug"] = {
      phase1_fanout_ms: 0,
      phase2_generation_ms: 0,
      phase3_anonymize_ms: 0,
      phase4_critique_ms: 0,
      phase5_synthesis_ms: 0,
    };

    console.log("🚀 Starting council query...");
    console.log("📝 Prompt:", prompt.substring(0, 100) + "...");
    console.log("🔧 Config:", JSON.stringify(this.config, null, 2));

    // Phase 1 & 2: Fan-out and Independent Generation
    console.log("\n📤 Phase 1 & 2: Fan-out and Generation...");
    const phase1Start = performance.now();
    const workerResponses = await this.executeWorkers(prompt, systemPrompt);
    debug.phase1_fanout_ms = performance.now() - phase1Start;
    debug.phase2_generation_ms = debug.phase1_fanout_ms;
    console.log(`✅ Got ${workerResponses.length} worker responses in ${debug.phase1_fanout_ms.toFixed(0)}ms`);

    if (workerResponses.length === 0) {
      throw new Error("No worker responses received");
    }

    // Phase 3: Anonymize & Share
    console.log("\n🎭 Phase 3: Anonymize & Share...");
    const phase3Start = performance.now();
    const shuffled = shuffleArray(workerResponses);
    const anonymized = this.anonymizeWorkerResponses(shuffled);
    debug.phase3_anonymize_ms = performance.now() - phase3Start;
    console.log(`✅ Anonymized ${anonymized.length} responses`);

    // Phase 4: Critique Round
    console.log("\n🔍 Phase 4: Critique Round...");
    const phase4Start = performance.now();
    const critiques = await this.executeCritiqueRound(prompt, anonymized);
    debug.phase4_critique_ms = performance.now() - phase4Start;
    console.log(`✅ Got ${critiques.length} critique sets in ${debug.phase4_critique_ms.toFixed(0)}ms`);

    // Aggregate critiques
    const aggregatedCritiques = this.aggregateCritiques(
      anonymized,
      critiques,
      shuffled
    );

    // Phase 5: Chairman Synthesis
    console.log("\n👑 Phase 5: Chairman Synthesis...");
    const phase5Start = performance.now();
    const finalResponse = await this.executeSynthesis(
      prompt,
      anonymized,
      critiques
    );
    debug.phase5_synthesis_ms = performance.now() - phase5Start;
    console.log(`✅ Synthesis complete in ${debug.phase5_synthesis_ms.toFixed(0)}ms`);

    const totalLatencyMs = performance.now() - startTime;
    console.log(`\n🎉 Total time: ${totalLatencyMs.toFixed(0)}ms`);

    return {
      finalResponse,
      chairmanModel: this.config.chairmanModel || "default",
      workerResponses,
      critiques,
      aggregatedCritiques,
      totalLatencyMs,
      ...(this.config.debug ? { debug } : {}),
    };
  }

  /**
   * Phase 1 & 2: Execute all worker models in parallel
   */
  private async executeWorkers(
    prompt: string,
    systemPrompt?: string
  ): Promise<WorkerResponse[]> {
    const availableProviders = this.config.workerProviders.filter((id) =>
      this.registry.hasProvider(id)
    );

    console.log(`  Available providers: ${availableProviders.join(", ")}`);

    if (availableProviders.length === 0) {
      throw new Error("No LLM providers available for council workers");
    }

    const requests = availableProviders.map(async (providerId) => {
      const provider = this.registry.getProvider(providerId);
      if (!provider) {
        console.log(`  ❌ Provider ${providerId} not found`);
        return null;
      }

      const messages: GenerationRequest["messages"] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      try {
        console.log(`  ⏳ Calling ${providerId}...`);
        const response = await provider.generate({
          messages,
          maxTokens: this.config.maxTokens ?? 4096,
          temperature: this.config.temperature ?? 0.7,
        });
        console.log(`  ✅ ${providerId} responded (${response.latencyMs.toFixed(0)}ms)`);

        return {
          providerId,
          modelId: response.model,
          response,
        };
      } catch (error) {
        console.error(`  ❌ Worker ${providerId} failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(requests);
    return results.filter((r): r is WorkerResponse => r !== null);
  }

  /**
   * Phase 3: Anonymize worker responses
   */
  private anonymizeWorkerResponses(
    responses: WorkerResponse[]
  ): AnonymizedResponse[] {
    return anonymizeResponses(responses.map((r) => ({ content: r.response.content })))
      .map((anon, idx) => ({
        id: anon.id,
        content: anon.content,
        _sourceProviderId: responses[idx]?.providerId,
        _sourceModelId: responses[idx]?.response.model,
      }));
  }

  /**
   * Phase 4: Execute critique round with all available models
   */
  private async executeCritiqueRound(
    originalPrompt: string,
    anonymizedResponses: AnonymizedResponse[]
  ): Promise<ModelCritique[]> {
    const formattedResponses = formatResponsesForCritique(anonymizedResponses);
    
    const critiquePrompt = `Original question: ${originalPrompt}

Here are the responses to evaluate:

${formattedResponses}

Evaluate each response and return a JSON array with this structure for each:
{
  "responseId": "Response A",
  "rank": 1,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1"],
  "errors": ["error if any"],
  "overallScore": 85,
  "reasoning": "Brief explanation"
}

Return ONLY the JSON array, no other text.`;

    const availableProviders = this.config.workerProviders.filter((id) =>
      this.registry.hasProvider(id)
    );

    const critiqueRequests = availableProviders.map(async (providerId) => {
      const provider = this.registry.getProvider(providerId);
      if (!provider) return null;

      const startTime = performance.now();

      try {
        console.log(`  ⏳ Getting critique from ${providerId}...`);
        const response = await provider.generate({
          messages: [
            { role: "system", content: SYSTEM_PROMPTS.critique },
            { role: "user", content: critiquePrompt },
          ],
          maxTokens: this.config.maxTokens ?? 4096,
          temperature: 0.3,
        });

        const latencyMs = performance.now() - startTime;
        console.log(`  ✅ ${providerId} critique done (${latencyMs.toFixed(0)}ms)`);

        // Parse critiques from response
        const critiques = this.parseCritiques(response.content);
        console.log(`  📊 Parsed ${critiques.length} critiques from ${providerId}`);

        return {
          criticProviderId: providerId,
          criticModelId: response.model,
          critiques,
          latencyMs,
        };
      } catch (error) {
        console.error(`  ❌ Critique from ${providerId} failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(critiqueRequests);
    return results.filter((r): r is ModelCritique => r !== null);
  }

  /**
   * Parse critiques from model response
   */
  private parseCritiques(content: string): Critique[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log("  ⚠️ No JSON array found in critique response");
        return [];
      }

      const parsed = JSON.parse(jsonMatch[0]) as unknown[];
      return parsed
        .map((item) => {
          const result = CritiqueSchema.safeParse(item);
          return result.success ? result.data : null;
        })
        .filter((c): c is Critique => c !== null);
    } catch (e) {
      console.error("  ❌ Failed to parse critiques:", e);
      return [];
    }
  }

  /**
   * Aggregate critiques for each response
   */
  private aggregateCritiques(
    anonymizedResponses: AnonymizedResponse[],
    modelCritiques: ModelCritique[],
    originalResponses: WorkerResponse[]
  ): AggregatedCritique[] {
    return anonymizedResponses.map((anonResponse, idx) => {
      const original = originalResponses[idx];
      const critiquesForResponse = modelCritiques.flatMap((mc) =>
        mc.critiques.filter((c) => c.responseId === anonResponse.id)
      );

      const stats = calculateCritiqueStats(critiquesForResponse);

      return {
        responseId: anonResponse.id,
        providerId: original?.providerId || ("unknown" as ProviderId),
        modelId: original?.response.model || "unknown",
        content: anonResponse.content,
        averageRank: stats.averageRank,
        averageScore: stats.averageScore,
        allStrengths: critiquesForResponse.flatMap((c) => c.strengths),
        allWeaknesses: critiquesForResponse.flatMap((c) => c.weaknesses),
        allErrors: critiquesForResponse.flatMap((c) => c.errors),
        votes: critiquesForResponse.filter((c) => c.rank === 1).length,
      };
    });
  }

  /**
   * Phase 5: Chairman synthesis
   */
  private async executeSynthesis(
    originalPrompt: string,
    anonymizedResponses: AnonymizedResponse[],
    modelCritiques: ModelCritique[]
  ): Promise<string> {
    const chairman = this.registry.getProvider(this.config.chairmanProvider);
    if (!chairman) {
      throw new Error(
        `Chairman provider ${this.config.chairmanProvider} not available`
      );
    }

    console.log(`  ⏳ Chairman (${this.config.chairmanProvider}) synthesizing...`);

    const critiquesFormatted = modelCritiques.map((mc, idx) => ({
      criticId: `Critic ${idx + 1}`,
      evaluations: JSON.stringify(mc.critiques, null, 2),
    }));

    const synthesisPrompt = formatForSynthesis(
      originalPrompt,
      anonymizedResponses,
      critiquesFormatted
    );

    const response = await chairman.generate(
      {
        messages: [
          { role: "system", content: SYSTEM_PROMPTS.synthesis },
          { role: "user", content: synthesisPrompt },
        ],
        maxTokens: this.config.maxTokens ?? 4096,
        temperature: 0.7,
      },
      this.config.chairmanModel
    );

    console.log(`  ✅ Chairman synthesis complete`);

    return response.content;
  }
}
