# LLM Council

> A simple, transparent LLM router that judges models on each task, instead of asking you to trust a single guess.

## 🧠 The Problem This Solves

1. **No single model wins everything** — GPT excels at coding, Claude at reasoning, Gemini at multimodal
2. **Benchmarks lie** — Static leaderboards don't reflect real-world, per-query performance
3. **Brand bias corrupts judgment** — Anonymity forces honest assessment
4. **Ensemble methods work in ML** — Why not apply ensemble thinking to LLMs?

**Karpathy's insight: Treat LLMs like a committee of experts, not a single oracle.**

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LLM COUNCIL PIPELINE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐    ┌─────────────────────────────────────────────┐   │
│  │   User   │───▶│           Phase 1: Fan-Out                  │   │
│  │  Prompt  │    │  Send to GPT, Claude, Gemini, Grok, etc.    │   │
│  └──────────┘    └─────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Phase 2: Independent Generation                 │   │
│  │  Each model generates response without seeing others         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Phase 3: Anonymize & Share                      │   │
│  │  Remove model names, share all responses with all models     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Phase 4: Critique Round                         │   │
│  │  Each model ranks, flags errors, explains weaknesses         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Phase 5: Chairman Synthesis                     │   │
│  │  Merge best reasoning, correct exposed errors                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│                                    ▼                                │
│  ┌──────────┐    ┌─────────────────────────────────────────────┐   │
│  │   User   │◀───│           Phase 6: Clean Output             │   │
│  │  Answer  │    │  One clean response, complexity invisible    │   │
│  └──────────┘    └─────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys (at least one required)
# OPENAI_API_KEY=sk-...
# GOOGLE_AI_KEY=AI...

# Start development servers
bun dev
```

## 🧪 Test the Council

Run the end-to-end test to see the council in action:

```bash
bun --env-file=.env run test-council.ts
```

### Example Output

```
=== Environment Check ===
OPENAI_API_KEY: SET
GOOGLE_AI_KEY: SET

=== Initializing Registry ===
Available providers: [ "openai", "google" ]

=== Creating Council (Google only mode) ===

=== Running Council Query ===
🚀 Starting council query...
�� Prompt: What are the main differences between Python and JavaScript? Be concise....
🔧 Config: {
  "workerProviders": [
    "google"
  ],
  "chairmanProvider": "google",
  "maxTokens": 4096,
  "temperature": 0.7,
  "debug": true
}

📤 Phase 1 & 2: Fan-out and Generation...
  Available providers: google
  ⏳ Calling google...
  ✅ google responded (7808ms)
✅ Got 1 worker responses in 7809ms

🎭 Phase 3: Anonymize & Share...
✅ Anonymized 1 responses

🔍 Phase 4: Critique Round...
  ⏳ Getting critique from google...
  ✅ google critique done (5387ms)
  📊 Parsed 1 critiques from google
✅ Got 1 critique sets in 5393ms

👑 Phase 5: Chairman Synthesis...
  ⏳ Chairman (google) synthesizing...
  ✅ Chairman synthesis complete
✅ Synthesis complete in 2759ms

🎉 Total time: 15962ms

=== Result ===
Final answer: Here are the main differences between Python and JavaScript:

*   **Primary Domain:**
    *   **Python:** Backend web development, data science, AI/ML, scripting, automation, desktop applications.
    *   **JavaScript:** Web browsers (frontend), backend (Node.js), mobile apps (React Native), desktop apps (Electron).

*   **Typing:**
    *   **Python:** Dynamically and **strongly** typed (fewer implicit type conversions).
    *   **JavaScript:** Dynamically and **loosely** typed (more implicit type conversions).

*   **Concurrency Model:**
    *   **Python:** Primarily synchronous (blocking) by default, relies on `async/await` for concurrency.
    *   **JavaScript:** Primarily asynchronous (non-blocking) via an event loop, well-suited for I/O operations.

*   **Syntax & Readability:**
    *   **Python:** Emphasizes readability with significant whitespace (indentation for code blocks).
    *   **JavaScript:** Uses curly braces `{}` for code blocks, similar to C-style languages.

*   **Execution Environment:**
    *   **Python:** Runs on a general-purpose interpreter (e.g., CPython); typically server-side or local scripts.
    *   **JavaScript:** Primarily runs in web browsers; Node.js provides a server-side runtime environment.
```

## 📁 Project Structure

```
llm-council/
├── apps/
│   ├── server/              # Hono + tRPC API server
│   └── web/                 # Next.js frontend
├── packages/
│   ├── llm-providers/       # @council/llm-providers - LLM integrations
│   ├── council-core/        # @council/council-core - Orchestration logic
│   ├── api/                 # @council/api - tRPC routers
│   ├── db/                  # @council/db - Database schema
│   └── auth/                # @council/auth - Authentication
└── docs/                    # Documentation
```

## 🔧 Environment Variables

```env
# LLM API Keys (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_AI_KEY=
GROK_API_KEY=

# Database
DATABASE_URL=

# Auth
BETTER_AUTH_SECRET=
```

## 🎯 Key Concepts

### Workers → Critics → Synthesis

Think of it like a **board of directors**:

- **Workers** = Each director gives their independent recommendation
- **Critics** = Directors challenge each other's reasoning  
- **Synthesis** = The CEO makes the final call, informed by all perspectives

### Use Cases

| Use Case | Why Council Works Better |
|----------|--------------------------|
| High-Stakes Decisions | Multiple perspectives catch blind spots |
| Complex Reasoning | Different models excel at different reasoning styles |
| Fact-Checking | Cross-validation exposes hallucinations |
| Creative Work | Diverse outputs → richer synthesis |
| Enterprise AI | Reduces single-vendor risk and bias |

## 📚 Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and data flow
- [API Reference](./docs/API_REFERENCE.md) - tRPC endpoints and types
- [Development](./docs/DEVELOPMENT.md) - Local setup and contribution

## 📄 License

MIT
