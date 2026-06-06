import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { MockAiProvider } from './providers/mock.provider';
import { AiCompletionOptions, AiCompletionResult, AiProvider } from './ai.types';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor(
    private readonly config: ConfigService,
    private readonly openai: OpenAiProvider,
    private readonly anthropic: AnthropicProvider,
    private readonly mock: MockAiProvider,
  ) {
    this.provider = this.resolveProvider();
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    try {
      return await this.provider.complete(options);
    } catch (error) {
      this.logger.error(`AI completion failed on ${this.provider.getName()}: ${error.message}`);

      // Fallback to mock in development
      if (this.config.get('nodeEnv') === 'development') {
        this.logger.warn('Falling back to mock provider');
        return this.mock.complete(options);
      }

      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }
  }

  async completeJson<T>(options: AiCompletionOptions): Promise<T> {
    const result = await this.complete({ ...options, jsonMode: true });
    try {
      return JSON.parse(result.content) as T;
    } catch {
      // Try to extract JSON from the response
      const match = result.content.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]) as T;
      throw new Error('AI response was not valid JSON');
    }
  }

  getProviderName(): string {
    return this.provider.getName();
  }

  private resolveProvider(): AiProvider {
    const configured = this.config.get<string>('ai.provider');

    if (configured === 'anthropic' && this.anthropic.isAvailable()) return this.anthropic;
    if (configured === 'openai' && this.openai.isAvailable()) return this.openai;

    // Auto-fallback
    if (this.openai.isAvailable()) return this.openai;
    if (this.anthropic.isAvailable()) return this.anthropic;

    this.logger.warn('No AI provider available — using mock');
    return this.mock;
  }
}
