/**
 * LLM Adapter for provider-agnostic AI generation
 * Used by: Backend - Core modules for LLM interactions
 * 
 * @tags llm, adapter, gemini, openai, provider-agnostic
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { z } from 'zod';

export interface LLMConfig {
  provider: 'gemini' | 'openai';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxRetries?: number;
}

export interface LLMResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Base LLM adapter class for JSON generation with schema validation
 * Used by: Backend - All LLM-based generation modules
 * 
 * @tags llm-base, json-generation, schema-validation
 */
export abstract class LLMAdapter {
  protected temperature: number;
  protected maxRetries: number;

  constructor(config: LLMConfig) {
    this.temperature = config.temperature ?? 0.3;
    this.maxRetries = config.maxRetries ?? 3;
  }

  abstract generateJSON<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemPrompt?: string
  ): Promise<LLMResponse<T>>;

  /**
   * Validates and parses JSON response with Zod schema
   * Used by: Backend - LLM adapters for response validation
   * 
   * @tags validation, json-parser, error-handling
   */
  protected validateJSON<T>(
    jsonString: string,
    schema: z.ZodSchema<T>
  ): T | null {
    try {
      // Clean JSON string (remove markdown code blocks if present)
      const cleanJson = jsonString
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanJson);
      return schema.parse(parsed);
    } catch (error) {
      console.error('JSON validation failed:', error);
      return null;
    }
  }

  /**
   * Implements retry logic with exponential backoff
   * Used by: Backend - LLM adapters for reliability
   * 
   * @tags retry, exponential-backoff, reliability
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

/**
 * Gemini adapter implementation for Google's Generative AI
 * Used by: Backend - Primary LLM provider for all generation tasks
 * 
 * @tags gemini, google-ai, primary-provider
 */
export class GeminiAdapter extends LLMAdapter {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model ?? 'gemini-1.5-flash';
  }

  async generateJSON<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemPrompt?: string
  ): Promise<LLMResponse<T>> {
    try {
      const result = await this.retryWithBackoff(async () => {
        const model = this.client.getGenerativeModel({ 
          model: this.model,
          generationConfig: {
            temperature: this.temperature,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          }
        });

        const fullPrompt = `${systemPrompt ? systemPrompt + '\n\n' : ''}
${prompt}

IMPORTANT: Respond with valid JSON that matches this schema:
${JSON.stringify(schema._def, null, 2)}

Ensure your response is a valid JSON object, not wrapped in markdown code blocks.`;

        const response = await model.generateContent(fullPrompt);
        const text = response.response.text();
        
        const validated = this.validateJSON(text, schema);
        if (!validated) {
          throw new Error('Invalid JSON response from model');
        }

        return {
          data: validated,
          usage: response.response.usageMetadata
        };
      });

      return {
        success: true,
        data: result.data,
        usage: result.usage ? {
          promptTokens: result.usage.promptTokenCount || 0,
          completionTokens: result.usage.candidatesTokenCount || 0,
          totalTokens: result.usage.totalTokenCount || 0
        } : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * OpenAI adapter implementation (backup provider)
 * Used by: Backend - Fallback LLM provider when Gemini unavailable
 * 
 * @tags openai, gpt, fallback-provider
 */
export class OpenAIAdapter extends LLMAdapter {
  private client: OpenAI;
  private model: string;

  constructor(config: LLMConfig) {
    super(config);
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model ?? 'gpt-4-turbo-preview';
  }

  async generateJSON<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemPrompt?: string
  ): Promise<LLMResponse<T>> {
    try {
      const result = await this.retryWithBackoff(async () => {
        const messages: OpenAI.ChatCompletionMessageParam[] = [
          {
            role: 'system',
            content: systemPrompt ?? 'You are a helpful assistant that always responds with valid JSON.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema._def, null, 2)}`
          }
        ];

        const response = await this.client.chat.completions.create({
          model: this.model,
          messages,
          temperature: this.temperature,
          response_format: { type: 'json_object' },
          max_tokens: 4096
        });

        const text = response.choices[0]?.message?.content || '';
        const validated = this.validateJSON(text, schema);
        
        if (!validated) {
          throw new Error('Invalid JSON response from model');
        }

        return {
          data: validated,
          usage: response.usage
        };
      });

      return {
        success: true,
        data: result.data,
        usage: result.usage ? {
          promptTokens: result.usage.prompt_tokens || 0,
          completionTokens: result.usage.completion_tokens || 0,
          totalTokens: result.usage.total_tokens || 0
        } : undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * Factory function to create LLM adapter based on provider
 * Used by: Backend - All modules requiring LLM functionality
 * 
 * @tags factory, adapter-creation, provider-selection
 */
export function createLLMAdapter(config: LLMConfig): LLMAdapter {
  switch (config.provider) {
    case 'gemini':
      return new GeminiAdapter(config);
    case 'openai':
      return new OpenAIAdapter(config);
    default:
      throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }
}

export default {
  createLLMAdapter,
  GeminiAdapter,
  OpenAIAdapter
};