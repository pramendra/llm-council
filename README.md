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

# Start development servers
bun dev

# Build for production
bun build
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
# LLM API Keys
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

## 📄 License

MIT
