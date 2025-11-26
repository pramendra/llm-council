import type { LLMProvider, ProviderId, ProviderConfig } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { AnthropicProvider } from "./providers/anthropic";
import { GoogleProvider } from "./providers/google";
import { GrokProvider } from "./providers/grok";

export interface ProviderRegistryConfig {
  openai?: ProviderConfig;
  anthropic?: ProviderConfig;
  google?: ProviderConfig;
  grok?: ProviderConfig;
}

/**
 * Registry for managing multiple LLM providers
 */
export class ProviderRegistry {
  private providers: Map<ProviderId, LLMProvider> = new Map();

  constructor(config: ProviderRegistryConfig = {}) {
    // Initialize all providers
    const openai = new OpenAIProvider(config.openai);
    const anthropic = new AnthropicProvider(config.anthropic);
    const google = new GoogleProvider(config.google);
    const grok = new GrokProvider(config.grok);

    // Only register available providers
    if (openai.isAvailable()) this.providers.set("openai", openai);
    if (anthropic.isAvailable()) this.providers.set("anthropic", anthropic);
    if (google.isAvailable()) this.providers.set("google", google);
    if (grok.isAvailable()) this.providers.set("grok", grok);
  }

  /**
   * Get a specific provider by ID
   */
  getProvider(id: ProviderId): LLMProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Get all available providers
   */
  getAvailableProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get list of available provider IDs
   */
  getAvailableProviderIds(): ProviderId[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Check if a provider is available
   */
  hasProvider(id: ProviderId): boolean {
    return this.providers.has(id);
  }

  /**
   * Get count of available providers
   */
  get count(): number {
    return this.providers.size;
  }
}
