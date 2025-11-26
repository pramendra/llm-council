console.log("Direct check:");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 10)}...` : "NOT SET");
console.log("GOOGLE_AI_KEY:", process.env.GOOGLE_AI_KEY ? `${process.env.GOOGLE_AI_KEY.substring(0, 10)}...` : "NOT SET");
console.log("ANTHROPIC_API_KEY:", process.env.ANTHROPIC_API_KEY ? `${process.env.ANTHROPIC_API_KEY.substring(0, 10)}...` : "NOT SET");
console.log("Bun.env check:");
console.log("OPENAI_API_KEY from Bun.env:", Bun.env.OPENAI_API_KEY ? `${Bun.env.OPENAI_API_KEY.substring(0, 10)}...` : "NOT SET");
