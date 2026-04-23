# CLAUDE.md - Multi-Model Receipts

A universal AI model usage receipt generator - track tokens and costs across multiple providers.

## Project Overview

This is a CLI tool that generates beautiful thermal printer-style receipts for AI model usage across OpenAI, Anthropic, Google Gemini, Azure, MiniMax, and more.

## Development

```bash
# Build TypeScript
npm run build

# Watch mode
npm run dev

# Test CLI
node bin/cli.js generate --help
node bin/cli.js providers

# Install locally
npm link
multi-model-receipts generate --provider openai --api-key sk-xxx
```

## Architecture

- `src/cli.ts` - CLI entry point using commander
- `src/commands/` - Command implementations (generate, setup, config, providers)
- `src/core/` - Core logic
  - `receipt-generator.ts` - Fetches usage data from providers
  - `html-renderer.ts` - Generates HTML receipts (thermal printer aesthetic)
  - `console-renderer.ts` - ASCII art console output
  - `pricing.ts` - Model pricing data and cost calculations
- `src/utils/` - Formatting utilities
- `src/types/` - TypeScript type definitions

## Key Design Decisions

- ESM-only (Node 22+)
- Provider-agnostic architecture
- Thermal printer receipt aesthetic (black & white, dotted lines, ASCII logos)
- Config stored at `~/.multi-model-receipts.config.json`
- Receipts saved to `~/.multi-model-receipts/receipts/`

## Pricing

Pricing data is stored in `src/core/pricing.ts`. PRs welcome to update prices as providers change.
