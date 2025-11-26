# API Reference

## Overview

The LLM Council API is built with tRPC and provides type-safe endpoints for interacting with the council system.

## Base URL

```
http://localhost:3001/trpc
```

## Endpoints

### Health Check

```typescript
// GET /trpc/healthCheck
const result = await trpc.healthCheck.query();
// Returns: { status: "ok", timestamp: "2024-01-01T00:00:00.000Z" }
```

### Council

#### Get Available Providers

```typescript
// GET /trpc/council.getProviders
const providers = await trpc.council.getProviders.query();
// Returns: { available: ["openai", "anthropic", "google", "grok"], count: 4 }
```

#### Execute Council Query

```typescript
// POST /trpc/council.query
const result = await trpc.council.query.mutate({
  prompt: "What is the meaning of life?",
  systemPrompt: "You are a helpful philosopher.", // optional
  config: {
    workerProviders: ["openai", "anthropic"], // optional, defaults to all
    chairmanProvider: "anthropic", // optional
    maxTokens: 4096, // optional
    temperature: 0.7, // optional
    debug: false, // optional
  },
});

// Returns:
interface CouncilQueryResult {
  finalResponse: string;
  chairmanModel: string;
  totalLatencyMs: number;
  workerCount: number;
  critiqueCount: number;
  aggregatedCritiques: Array<{
    responseId: string;
    providerId: string;
    modelId: string;
    averageRank: number;
    averageScore: number;
    votes: number;
  }>;
  debug?: {
    phase1_fanout_ms: number;
    phase2_generation_ms: number;
    phase3_anonymize_ms: number;
    phase4_critique_ms: number;
    phase5_synthesis_ms: number;
  };
}
```

#### Execute Council Query with Full Details (Protected)

Requires authentication. Returns complete response data including all worker responses and critiques.

```typescript
// POST /trpc/council.queryWithDetails
const result = await trpc.council.queryWithDetails.mutate({
  prompt: "Explain quantum entanglement",
});

// Returns full CouncilResult including:
// - All worker responses with content
// - All critiques with strengths/weaknesses/errors
// - Aggregated critique data
```

#### Single Model Query

Query a single model directly (for comparison).

```typescript
// POST /trpc/council.singleModelQuery
const result = await trpc.council.singleModelQuery.mutate({
  prompt: "Hello, world!",
  systemPrompt: "Be concise.", // optional
  providerId: "openai",
  modelId: "gpt-4o", // optional, uses provider default
});

// Returns:
interface SingleModelResult {
  content: string;
  model: string;
  providerId: string;
  latencyMs: number;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

## Types

### ProviderId

```typescript
type ProviderId = "openai" | "anthropic" | "google" | "grok";
```

### Message

```typescript
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}
```

### Critique

```typescript
interface Critique {
  responseId: string;
  rank: number;
  strengths: string[];
  weaknesses: string[];
  errors: string[];
  overallScore: number;
  reasoning: string;
}
```

### CouncilConfig

```typescript
interface CouncilConfig {
  workerProviders?: ProviderId[];
  chairmanProvider?: ProviderId;
  chairmanModel?: string;
  maxTokens?: number;
  temperature?: number;
  debug?: boolean;
}
```

## Error Handling

All endpoints return standard tRPC errors:

```typescript
try {
  await trpc.council.query.mutate({ prompt: "" });
} catch (error) {
  if (error.code === "BAD_REQUEST") {
    // Invalid input
  }
  if (error.code === "UNAUTHORIZED") {
    // Authentication required
  }
  if (error.code === "INTERNAL_SERVER_ERROR") {
    // Server error
  }
}
```

## Authentication

Protected routes require a valid session. Use Better-Auth for authentication:

```typescript
// Sign in
await fetch("http://localhost:3001/api/auth/sign-in", {
  method: "POST",
  credentials: "include",
  body: JSON.stringify({ email, password }),
});

// Session is automatically sent via cookies
```

## Rate Limiting

(Coming soon)

- 10 requests per minute for unauthenticated users
- 100 requests per minute for authenticated users

## WebSocket Support

(Coming soon)

Real-time streaming of council deliberations.
