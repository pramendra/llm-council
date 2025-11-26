# Contributing to LLM Council

First off, thank you for considering contributing to LLM Council! 🎉

## How Can I Contribute?

### Reporting Bugs

- **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/pramendra/llm-council/issues).
- If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/pramendra/llm-council/issues/new).
- Include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior.

### Suggesting Enhancements

- Open an issue with the tag `enhancement`
- Clearly describe the feature and why it would be useful
- Include code examples if applicable

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code, add tests
3. Ensure the test suite passes: `bun test`
4. Make sure your code lints: `bun check-types`
5. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/llm-council.git
cd llm-council

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Edit .env with at least one API key
# GOOGLE_AI_KEY=your_key

# Run tests
bun --env-file=.env run test-council.ts

# Start development
bun dev
```

## Adding a New LLM Provider

1. Create a new file in `packages/llm-providers/src/providers/`
2. Implement the `LLMProvider` interface
3. Export from `packages/llm-providers/src/providers/index.ts`
4. Register in `packages/llm-providers/src/registry.ts`
5. Update the `ProviderId` type

## Code Style

- TypeScript with strict mode
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Reference issues and pull requests liberally

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
