# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           LLM COUNCIL SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │   Next.js    │────▶│   Hono API   │────▶│   Council    │            │
│  │   Frontend   │     │   + tRPC     │     │    Core      │            │
│  └──────────────┘     └──────────────┘     └──────────────┘            │
│                              │                    │                     │
│                              │                    ▼                     │
│                              │         ┌──────────────────┐            │
│                              │         │  LLM Providers   │            │
│                              │         ├──────────────────┤            │
│                              │         │ • OpenAI         │            │
│                              │         │ • Anthropic      │            │
│                              │         │ • Google         │            │
│                              │         │ • xAI (Grok)     │            │
│                              │         └──────────────────┘            │
│                              │                                          │
│                              ▼                                          │
│                    ┌──────────────────┐                                │
│                    │    PostgreSQL    │                                │
│                    │   (Drizzle ORM)  │                                │
│                    └──────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Pipeline Flow

### Phase 1: Fan-Out

```typescript
// User prompt is sent to all available providers in parallel
const workerResponses = await Promise.all(
  availableProviders.map(provider => provider.generate(prompt))
);
```

### Phase 2: Independent Generation

Each model generates independently:
- No shared context between models
- No coordination
- Pure, uninfluenced responses

### Phase 3: Anonymize & Share

```typescript
// Responses are shuffled and anonymized
const anonymized = [
  { id: "Response A", content: "..." },
  { id: "Response B", content: "..." },
  // Source model info hidden
];
```

### Phase 4: Critique Round

Each model receives all anonymized responses and returns:

```typescript
interface Critique {
  responseId: string;      // "Response A"
  rank: number;            // 1 = best
  strengths: string[];     // What's good
  weaknesses: string[];    // What's lacking
  errors: string[];        // Factual/logical errors
  overallScore: number;    // 0-100
  reasoning: string;       // Why this ranking
}
```

### Phase 5: Chairman Synthesis

The chairman model receives:
1. Original user question
2. All anonymized responses
3. All critiques from all models

It then synthesizes the best answer by:
- Merging strongest reasoning
- Correcting flagged errors
- Resolving disagreements

### Phase 6: Clean Output

User receives one clean response with optional metadata:
- Which models participated
- Ranking summary
- Total latency

## Package Dependencies

```
@council/web ──────┬──▶ @council/api
                   │
@council/server ───┴──▶ @council/api
                            │
                            ├──▶ @council/council-core
                            │         │
                            │         └──▶ @council/llm-providers
                            │
                            ├──▶ @council/auth
                            │         │
                            │         └──▶ @council/db
                            │
                            └──▶ @council/db
```

## Data Model

### Council Query

```sql
council_query
├── id (uuid)
├── user_id (text, nullable)
├── prompt (text)
├── system_prompt (text, nullable)
├── final_response (text)
├── chairman_provider (text)
├── chairman_model (text)
├── total_latency_ms (int)
├── config (jsonb)
├── debug (jsonb)
└── created_at (timestamp)
```

### Worker Response

```sql
worker_response
├── id (uuid)
├── query_id (uuid) → council_query
├── provider_id (text)
├── model_id (text)
├── content (text)
├── latency_ms (int)
├── prompt_tokens (int)
├── completion_tokens (int)
└── created_at (timestamp)
```

### Model Critique

```sql
model_critique
├── id (uuid)
├── query_id (uuid) → council_query
├── critic_provider_id (text)
├── critic_model_id (text)
├── latency_ms (int)
└── created_at (timestamp)

critique_entry
├── id (uuid)
├── critique_id (uuid) → model_critique
├── response_id (text)
├── rank (int)
├── overall_score (real)
├── strengths (jsonb)
├── weaknesses (jsonb)
├── errors (jsonb)
└── reasoning (text)
```

## Security Considerations

1. **API Key Protection** - All LLM API keys stored in environment variables
2. **Authentication** - Better-Auth with session management
3. **CORS** - Configured for specific frontend origins
4. **Rate Limiting** - (TODO) Implement per-user rate limits
5. **Input Validation** - Zod schemas for all inputs

## Performance Optimizations

1. **Parallel Execution** - Fan-out and critique phases run in parallel
2. **Streaming** - (TODO) Implement streaming for real-time feedback
3. **Caching** - (TODO) Cache identical queries
4. **Provider Failover** - Continue with available providers if one fails
