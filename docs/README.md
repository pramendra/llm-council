# LLM Council Documentation

> A transparent LLM router that judges models on each task using ensemble methods

## Overview

LLM Council implements Karpathy's insight: **Treat LLMs like a committee of experts, not a single oracle.**

## Architecture

The system follows a 6-phase pipeline:

1. **Fan-Out** - Send user prompt to multiple models simultaneously
2. **Independent Generation** - Each model generates response without seeing others
3. **Anonymize & Share** - Remove model identities, share all responses with all models
4. **Critique Round** - Each model ranks, flags errors, and evaluates all responses
5. **Chairman Synthesis** - A designated model synthesizes the best answer
6. **Clean Output** - User sees one clean response

## Key Insights

1. **Ensemble > Individual** - Multiple models catch blind spots
2. **Anonymity Forces Honesty** - Models judge on merit, not brand
3. **Dynamic > Static Benchmarks** - Per-query evaluation beats MMLU scores
4. **Critique as Feature** - Error flags and reasoning improve output

## Project Structure

```
llm-council/
├── apps/
│   ├── server/           # Hono + tRPC API
│   └── web/              # Next.js frontend
├── packages/
│   ├── llm-providers/    # LLM SDK integrations
│   ├── council-core/     # Orchestration logic
│   ├── api/              # tRPC routers
│   ├── db/               # Drizzle schema
│   └── auth/             # Better-Auth setup
└── docs/                 # This documentation
```

## Documentation Index

- [Architecture](./ARCHITECTURE.md) - System design and data flow
- [API Reference](./API_REFERENCE.md) - tRPC endpoints and types
- [Development](./DEVELOPMENT.md) - Local setup and contribution
- [Deployment](./DEPLOYMENT.md) - Production deployment guide
