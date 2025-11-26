import { ProviderRegistry } from "@council/llm-providers";
import { Council } from "@council/council-core";

async function main() {
  console.log("\n=== Environment Check ===");
  console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
  console.log("GOOGLE_AI_KEY:", process.env.GOOGLE_AI_KEY ? "SET" : "NOT SET");

  console.log("\n=== Initializing Registry ===");
  const registry = new ProviderRegistry();
  const available = registry.getAvailableProviders();
  console.log("Available providers:", available.map((p) => p.id));

  // Since OpenAI quota is exceeded, use only Google for both worker and chairman
  console.log("\n=== Creating Council (Google only mode) ===");
  const council = new Council(registry, {
    workerProviders: ["google"],
    chairmanProvider: "google",
    debug: true,
  });

  console.log("\n=== Running Council Query ===");
  const result = await council.query(
    "What are the main differences between Python and JavaScript? Be concise."
  );

  console.log("\n=== Result ===");
  console.log("Final answer:", result.finalResponse);
  console.log("\n=== Individual Responses ===");
  for (const wr of result.workerResponses) {
    console.log(`${wr.providerId}:`, wr.response.content.substring(0, 200) + "...");
  }
}

main().catch(console.error);
