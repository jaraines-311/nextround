import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiProvider, AiCompletionOptions, AiCompletionResult } from '../ai.types';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly client: OpenAI | null;
  private readonly model: string;

  // Approximate cost per 1K tokens (input + output blended) for tracking
  private readonly costPer1kTokens = 0.005;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('ai.openaiApiKey');
    this.model = config.get<string>('ai.openaiModel') || 'gpt-4o';

    if (apiKey) {
      this.client = new OpenAI({ apiKey });
    } else {
      this.client = null;
      this.logger.warn('OpenAI API key not configured — provider unavailable');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getName(): string {
    return 'openai';
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: options.messages as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
      response_format: options.jsonMode ? { type: 'json_object' } : undefined,
    });

    const choice = response.choices[0];
    const tokensUsed = response.usage?.total_tokens ?? 0;

    return {
      content: choice.message.content || '',
      tokensUsed,
      providerCostUsd: (tokensUsed / 1000) * this.costPer1kTokens,
      provider: 'openai',
      model: this.model,
    };
  }
}
