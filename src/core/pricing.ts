// Pricing data for each provider (prices per 1M tokens)
import type { Provider } from '../types/index.js';

// Official pricing (USD per million tokens)
export const PRICING: Record<string, { input: number; output: number; cacheCreation?: number; cacheRead?: number }> = {
  // OpenAI
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'gpt-4': { input: 30.0, output: 60.0 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  'gpt-4o-2024-05-13': { input: 5.0, output: 15.0 },
  'gpt-4-turbo-2024-04-09': { input: 10.0, output: 30.0 },
  'gpt-4-0613': { input: 30.0, output: 60.0 },
  'gpt-3.5-turbo-0125': { input: 0.5, output: 1.5 },

  // Anthropic (prices per million tokens)
  'claude-opus-4-5': { input: 15.0, output: 75.0, cacheCreation: 18.75, cacheRead: 1.5 },
  'claude-sonnet-4-5': { input: 3.0, output: 15.0, cacheCreation: 3.75, cacheRead: 0.3 },
  'claude-haiku-4-5': { input: 0.8, output: 4.0, cacheCreation: 1.0, cacheRead: 0.08 },
  'claude-3-opus': { input: 15.0, output: 75.0, cacheCreation: 18.75, cacheRead: 1.5 },
  'claude-3-sonnet': { input: 3.0, output: 15.0, cacheCreation: 3.75, cacheRead: 0.3 },
  'claude-3-haiku': { input: 0.25, output: 1.25, cacheCreation: 0.3, cacheRead: 0.03 },

  // Google Gemini
  'gemini-1.5-pro': { input: 3.5, output: 10.5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-1.5-flash-8b': { input: 0.0375, output: 0.15 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-pro': { input: 0.125, output: 0.50 },
  'gemini-ultra': { input: 1.25, output: 5.00 },

  // MiniMax (estimated, using their official pricing)
  'MiniMax-Text-01': { input: 0.5, output: 1.0 },  // Very cheap!
  'abab6.5s-chat': { input: 0.5, output: 1.0 },
  'abab5.5s-chat': { input: 0.5, output: 1.0 },

  // Groq (prices per million tokens)
  'llama-3.1-70b': { input: 0.59, output: 0.79 },
  'llama-3.1-8b': { input: 0.05, output: 0.08 },
  'mixtral-8x7b': { input: 0.24, output: 0.24 },

  // Cohere
  'command-r-plus': { input: 3.0, output: 15.0 },
  'command-r': { input: 0.5, output: 1.5 },
};

// Default pricing for unknown models
const DEFAULT_INPUT_PRICE = 1.0;
const DEFAULT_OUTPUT_PRICE = 2.0;

export function getModelPrice(model: string): { input: number; output: number; cacheCreation?: number; cacheRead?: number } {
  // Try exact match first
  if (PRICING[model]) {
    return PRICING[model];
  }

  // Try prefix match (some models have version suffixes)
  for (const [key, price] of Object.entries(PRICING)) {
    if (model.startsWith(key) || key.startsWith(model.split('-').slice(0, -1).join('-'))) {
      return price;
    }
  }

  // Default pricing
  return { input: DEFAULT_INPUT_PRICE, output: DEFAULT_OUTPUT_PRICE };
}

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheCreationTokens?: number,
  cacheReadTokens?: number
): number {
  const price = getModelPrice(model);

  const inputCost = (inputTokens / 1_000_000) * price.input;
  const outputCost = (outputTokens / 1_000_000) * price.output;
  const cacheCreationCost = cacheCreationTokens
    ? (cacheCreationTokens / 1_000_000) * (price.cacheCreation || price.input * 0.5)
    : 0;
  const cacheReadCost = cacheReadTokens
    ? (cacheReadTokens / 1_000_000) * (price.cacheRead || price.input * 0.1)
    : 0;

  return inputCost + outputCost + cacheCreationCost + cacheReadCost;
}

export const PROVIDER_NAMES: Record<Provider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google AI',
  azure: 'Azure OpenAI',
  minimax: 'MiniMax',
  groq: 'Groq',
  cohere: 'Cohere',
};

export const PROVIDER_LOGOS: Record<Provider, string> = {
  openai: `
   █████╗ ██╗  ██╗██╗ ██████╗ ███╗   ███╗
  ██╔══██╗╚██╗██╔╝██║██╔═══██╗████╗ ████║
  ███████║ ╚███╔╝ ██║██║   ██║██╔████╔██║
  ██╔══██║ ██╔██╗ ██║██║   ██║██║╚██╔╝██║
  ██║  ██║██╔╝ ██╗██║╚██████╔╝██║ ╚═╝ ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝     ╚═╝`,
  anthropic: `
   ╔═══════════════════════════════════════╗
   ║   █████╗    ██████╗  ██████╗ ██████╗  ║
   ║  ██╔══██╗  ██╔════╝ ██╔═══██╗██╔══██╗ ║
   ║  ███████║  ██║  ███╗██║   ██║██║  ██║ ║
   ║  ██╔══██║  ██║   ██║██║   ██║██║  ██║ ║
   ║  ██║  ██║  ╚██████╔╝╚██████╔╝██████╔╝ ║
   ║  ╚═╝  ╚═╝   ╚═════╝  ╚═════╝ ╚═════╝  ║
   ╚═══════════════════════════════════════╝`,
  google: `
   ╭─────────────────────────────────────╮
   │  ██╗   ██╗ ██████╗ ██╗██████╗       │
   │  ██║   ██║██╔═══██╗██║██╔══██╗      │
   │  ██║   ██║██║   ██║██║██║  ██║      │
   │  ╚██╗ ██╔╝██║   ██║██║██║  ██║      │
   │   ╚████╔╝ ╚██████╔╝██║██████╔╝      │
   │    ╚═══╝   ╚═════╝ ╚═╝╚═════╝       │
   ╰─────────────────────────────────────╯`,
  azure: `
   ┌─────────────────────────────────────┐
   │  ██╗  ██╗███████╗ █████╗ ███╗   ██╗ │
   │  ██║  ██║██╔════╝██╔══██╗████╗  ██║ │
   │  ███████║█████╗  ███████║██╔██╗ ██║ │
   │  ██╔══██║██╔══╝  ██╔══██║██║╚██╗██║ │
   │  ██║  ██║███████╗██║  ██║██║ ╚████║ │
   │  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝ │
   │        Microsoft Azure              │
   └─────────────────────────────────────┘`,
  minimax: `
   ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃  ███╗   ██╗███████╗██╗  ██╗██╗   ██╗┃
   ┃  ████╗  ██║██╔════╝╚██╗██╔╝██║   ██║┃
   ┃  ██╔██╗ ██║█████╗   ╚███╔╝ ██║   ██║┃
   ┃  ██║╚██╗██║██╔══╝   ██╔██╗ ██║   ██║┃
   ┃  ██║ ╚████║███████╗██╔╝ ██╗╚██████╔╝┃
   ┃  ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ┃
   ┃         M i n i M a x              ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`,
  groq: `
   ╔═══════════════════════════════════╗
   ║   █████╗     ██████╗ ██████╗ ██╗   ██╗███████╗██████╗  ║
   ║  ██╔══██╗   ██╔════╝██╔═══██╗██║   ██║██╔════╝██╔══██╗ ║
   ║  ███████║   ██║     ██║   ██║██║   ██║█████╗  ██████╔╝ ║
   ║  ██╔══██║   ██║     ██║   ██║╚██╗ ██╔╝██╔══╝  ██╔══██╗ ║
   ║  ██║  ██║   ╚██████╗╚██████╔╝ ╚████╔╝ ███████╗██║  ██║ ║
   ║  ╚═╝  ╚═╝    ╚═════╝ ╚═════╝   ╚═══╝  ╚══════╝╚═╝  ╚═╝ ║
   ╚═══════════════════════════════════╝`,
  cohere: `
   ┌─────────────────────────────────────┐
   │  ██████╗ ██████╗ ██╗███████╗████████╗│
   │  ██╔══██╗██╔══██╗██║██╔════╝╚══██╔══╝│
   │  ██████╔╝██████╔╝██║█████╗     ██║   │
   │  ██╔═══╝ ██╔══██╗██║██╔══╝     ██║   │
   │  ██║     ██║  ██║██║██║        ██║   │
   │  ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   │
   └─────────────────────────────────────┘`,
};
