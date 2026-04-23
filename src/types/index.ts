// Provider types
export type Provider = 'openai' | 'anthropic' | 'google' | 'azure' | 'minimax' | 'groq' | 'cohere';

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  organization?: string;
}

// Usage data types
export interface ModelUsage {
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens?: number;
  cacheReadTokens?: number;
  totalTokens: number;
  cost: number;
  requestCount: number;
}

export interface ProviderUsage {
  provider: Provider;
  providerName: string;
  totalCost: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  requestCount: number;
  modelsUsed: ModelUsage[];
  startDate: Date;
  endDate: Date;
}

export interface AggregatedUsage {
  providers: ProviderUsage[];
  totalCost: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCacheCreationTokens: number;
  totalCacheReadTokens: number;
  totalRequestCount: number;
  period: Period;
  generatedAt: Date;
}

export type Period = 'today' | 'week' | 'month' | 'custom';

export interface PeriodOptions {
  period: Period;
  startDate?: Date;
  endDate?: Date;
}

// Receipt options
export interface ReceiptOptions {
  customBranding?: string;
  qrImagePath?: string;
  currency: string;
  timezone: string;
  showDetails: boolean;
  includeModels: string[];
  excludeModels: string[];
}

export interface ReceiptData {
  usage: AggregatedUsage;
  options: ReceiptOptions;
  generatedAt: Date;
}

// Config types
export interface Config {
  version: string;
  providers: Partial<Record<Provider, ProviderConfig>>;
  defaults: {
    output: string;
    period: Period;
    currency: string;
    timezone: string;
    openBrowser: boolean;
  };
  customBranding: string | null;
  qrImagePath: string | null;
}

// API response types
export interface OpenAIUsageResponse {
  data: Array<{
    aggregation: string;
    granularity: string;
    start_date: string;
    end_date: string;
    model: string;
    usage_by_day: Array<{
      date: string;
      cost: number;
      num_tokens: number;
      num_prompt_tokens: number;
      num_completion_tokens: number;
    }>;
  }>;
}

export interface AnthropicUsageResponse {
  costs: Array<{
    date: string;
    cost: number;
  }>;
}
