import { v } from 'convex/values';

// Provider types
export type Provider = 'novita' | 'cerebras' | 'openrouter';

export interface ProviderConfig {
  name: Provider;
  models: {
    primary: string;
    fallback: string;
    fast: string;
  };
  baseUrl: string;
  apiKeyEnv: string;
}

export const PROVIDER_CONFIGS: Record<Provider, ProviderConfig> = {
  novita: {
    name: 'novita',
    models: {
      primary: 'xiaomimimo/mimo-v2-flash',
      fallback: 'xiaomimimo/mimo-v2-flash',
      fast: 'xiaomimimo/mimo-v2-flash',
    },
    baseUrl: 'https://api.novita.ai/openai',
    apiKeyEnv: 'NOVITA_API_KEY',
  },
  cerebras: {
    name: 'cerebras',
    models: {
      primary: 'zai-glm-4.7',
      fallback: 'zai-glm-4.7',
      fast: 'zai-glm-4.7',
    },
    baseUrl: 'https://api.cerebras.ai/v1',
    apiKeyEnv: 'CEREBRAS_API_KEY',
  },
  openrouter: {
    name: 'openrouter',
    models: {
      primary: 'anthropic/claude-3.5-sonnet',
      fallback: 'openai/gpt-4o-mini',
      fast: 'openai/gpt-oss-120b',
    },
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKeyEnv: 'OPENROUTER_API_KEY',
  },
};

export interface GenerationRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  maxTokens: number;
  response_format?: { type: 'json_object' } | any;
}

export interface GenerationResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  provider: Provider;
}

export interface CostCalculation {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

// Pricing per million tokens (in dollars)
export const PRICING: Record<Provider, { [model: string]: { input: number; output: number } }> = {
  novita: {
    'xiaomimimo/mimo-v2-flash': { input: 0.10, output: 0.30 }, // $0.10 input, $0.30 output per million tokens
  },
  cerebras: {
    'zai-glm-4.7': { input: 0.15, output: 0.40 }, // $0.15 input, $0.40 output per million tokens
    'zai-glm-46': { input: 0.12, output: 0.35 },
  },
  openrouter: {
    'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 }, // $3.00 input, $15.00 output per million tokens
    'openai/gpt-4o-mini': { input: 0.15, output: 0.60 },
    'openai/gpt-oss-120b': { input: 0.08, output: 0.24 },
  },
};

export function calculateCost(
  provider: Provider,
  model: string,
  inputTokens: number,
  outputTokens: number
): CostCalculation {
  const pricing = PRICING[provider]?.[model];
  if (!pricing) {
    console.warn(`No pricing found for ${provider}/${model}, using defaults`);
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;

  return {
    inputCost: Math.round(inputCost * 1000000) / 1000000, // 6 decimal places for micro-costs
    outputCost: Math.round(outputCost * 1000000) / 1000000,
    totalCost: Math.round((inputCost + outputCost) * 1000000) / 1000000,
  };
}

export function getApiKey(provider: Provider): string {
  const config = PROVIDER_CONFIGS[provider];
  const apiKey = process.env[config.apiKeyEnv];

  if (!apiKey) {
    console.warn(`API key not found for ${provider}. Check ${config.apiKeyEnv} environment variable.`);
  }

  return apiKey || '';
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  inputTokens?: number;
  outputTokens?: number;
  error?: string;
}

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract generate(request: GenerationRequest, provider: Provider): Promise<GenerationResult>;

  protected async makeRequest(
    endpoint: string,
    body: any,
    headers: Record<string, string>
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      const url = `${this.config.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`${this.config.name} API error:`, errorText);
        return {
          success: false,
          error: `${this.config.name} API error (${response.status}): ${errorText}`,
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return {
          success: false,
          error: `Empty response from ${this.config.name}`,
        };
      }

      const inputTokens = data.usage?.prompt_tokens || 0;
      const outputTokens = data.usage?.completion_tokens || 0;

      return {
        success: true,
        content,
        inputTokens,
        outputTokens,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`${this.config.name} request failed:`, error);
      return {
        success: false,
        error: `${this.config.name} request failed: ${error.message}`,
      };
    }
  }
}

export class NovitaProvider extends BaseProvider {
  async generate(request: GenerationRequest, provider: Provider): Promise<GenerationResult> {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      console.log(`[PROVIDER-DEBUG] ${provider} API key missing`);
      return { success: false, error: 'Novita API key not configured' };
    }

    // Novita doesn't support response_format properly, so exclude it
    const requestBody = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      // Note: response_format removed for Novita compatibility
    };

    const startTime = Date.now();
    console.log(`[PROVIDER-DEBUG] ${provider} API call starting:`, {
      endpoint: this.config.baseUrl + '/chat/completions',
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      timestamp: new Date().toISOString()
    });

    const result = await this.makeRequest(
      '/chat/completions',
      requestBody,
      {
        Authorization: `Bearer ${apiKey}`,
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[PROVIDER-DEBUG] ${provider} API call completed in ${duration}ms`, {
      success: result.success,
      hasContent: !!result.content,
      contentLength: result.content?.length || 0,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens
    });

    return result;
  }
}

export class CerebrasProvider extends BaseProvider {
  async generate(request: GenerationRequest, provider: Provider): Promise<GenerationResult> {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      console.log(`[PROVIDER-DEBUG] ${provider} API key missing`);
      return { success: false, error: 'Cerebras API key not configured' };
    }

    // Cerebras doesn't support response_format properly, so exclude it
    const requestBody = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      // Note: response_format removed for Cerebras compatibility
    };

    const startTime = Date.now();
    console.log(`[PROVIDER-DEBUG] ${provider} API call starting:`, {
      endpoint: this.config.baseUrl + '/chat/completions',
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      timestamp: new Date().toISOString()
    });

    const result = await this.makeRequest(
      '/chat/completions',
      requestBody,
      {
        Authorization: `Bearer ${apiKey}`,
      }
    );

    const duration = Date.now() - startTime;
    console.log(`[PROVIDER-DEBUG] ${provider} API call completed in ${duration}ms`, {
      success: result.success,
      hasContent: !!result.content,
      contentLength: result.content?.length || 0,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens
    });

    return result;
  }
}

export class OpenRouterProvider extends BaseProvider {
  async generate(request: GenerationRequest, provider: Provider): Promise<GenerationResult> {
    const apiKey = getApiKey(provider);
    if (!apiKey) {
      return { success: false, error: 'OpenRouter API key not configured' };
    }

    return this.makeRequest(
      '/chat/completions',
      {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        response_format: request.response_format,
      },
      {
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.SITE_URL || 'https://bizgenius.app',
        'X-Title': 'BizGenius',
      }
    );
  }
}

export function getProvider(provider: Provider): BaseProvider {
  const config = PROVIDER_CONFIGS[provider];

  switch (provider) {
    case 'novita':
      return new NovitaProvider(config);
    case 'cerebras':
      return new CerebrasProvider(config);
    case 'openrouter':
      return new OpenRouterProvider(config);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}