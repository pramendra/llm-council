# Development Guide

## Prerequisites

- [Bun](https://bun.sh/) >= 1.3.0
- [Node.js](https://nodejs.org/) >= 20.0.0
- PostgreSQL 15+ (optional, for persistence)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/llm-council.git
cd llm-council

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
# At minimum, set one of:
# - OPENAI_API_KEY
# - ANTHROPIC_API_KEY
# - GOOGLE_AI_KEY
# - GROK_API_KEY

# Start development servers
bun dev
```

This starts:
- API server at http://localhost:3001
- Web app at http://localhost:3000

## Environment Variables

```env
# LLM API Keys (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_KEY=AI...
GROK_API_KEY=xai-...

# Database (optional)
DATABASE_URL=postgresql://localhost:5432/llm_council

# Auth (for protected routes)
BETTER_AUTH_SECRET=your-secret-key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Project Scripts

```bash
# Development
bun dev              # Start all apps in dev mode
bun dev --filter=@council/server  # Start only server
bun dev --filter=@council/web     # Start only web

# Building
bun build            # Build all packages
bun check-types      # TypeScript type checking

# Database
bun --filter=@council/db db:push     # Push schema to database
bun --filter=@council/db db:studio   # Open Drizzle Studio

# Testing
bun test             # Run all tests
```

## Adding a New LLM Provider

1. Create provider file in `packages/llm-providers/src/providers/`:

```typescript
// packages/llm-providers/src/providers/newprovider.ts
import type { LLMProvider, ProviderConfig, ModelConfig } from "./types";

export class NewProvider implements LLMProvider {
  readonly id = "newprovider" as const;
  readonly name = "New Provider";
  readonly availableModels: ModelConfig[] = [
    {
      providerId: "newprovider",
      modelId: "model-v1",
      displayName: "Model V1",
      maxTokens: 128000,
      supportsStreaming: true,
    },
  ];

  // ... implement generate(), isAvailable()
}
```

2. Export from `packages/llm-providers/src/providers/index.ts`

3. Add to `ProviderRegistry` in `packages/llm-providers/src/registry.ts`

4. Update `ProviderId` type in `packages/llm-providers/src/types.ts`

## Code Style

- **TypeScript** - Strict mode enabled
- **ESM** - ES modules only
- **Formatting** - Prettier (coming soon)
- **Linting** - ESLint (coming soon)

## Package Structure

Each package follows this structure:

```
packages/[name]/
├── package.json
├── tsconfig.json
├── tsdown.config.ts
└── src/
    ├── index.ts      # Main exports
    └── ...           # Implementation
```

## Testing

(Coming soon)

```bash
# Run unit tests
bun test

# Run with coverage
bun test --coverage

# Run specific package tests
bun test --filter=@council/council-core
```

## Debugging

### API Server

```bash
# Start server with debug logging
DEBUG=* bun --filter=@council/server dev
```

### Database

```bash
# Open Drizzle Studio for database inspection
bun --filter=@council/db db:studio
```

## Troubleshooting

### "Provider not available"

Make sure the corresponding API key is set in `.env`:

```env
OPENAI_API_KEY=sk-...
```

### "Cannot find module '@council/...'"

Run `bun install` to link workspace packages.

### Database connection errors

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` format
3. Run `bun --filter=@council/db db:push`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run tests and type checking
5. Submit a pull request

## Architecture Decisions

See [docs/ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.
