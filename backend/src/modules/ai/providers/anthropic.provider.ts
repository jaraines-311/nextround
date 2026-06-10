import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { AiProvider, AiCompletionOptions, AiCompletionResult, AiMessage } from '../ai.types';

@Injectable()
export class AnthropicProvider implements AiProvider {
  private readonly logger = new Logger(AnthropicProvider.name);
  private readonly client: Anthropic | null;
  private readonly model: string;

  private readonly costPer1kTokens = 0.006;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('ai.anthropicApiKey');
    this.model = config.get<string>('ai.anthropicModel') || 'claude-sonnet-4-6';

    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    } else {
      this.client = null;
      this.logger.warn('Anthropic API key not configured — provider unavailable');
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  getName(): string {
    return 'anthropic';
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const systemMessage = options.messages.find((m) => m.role === 'system')?.content;
    const userMessages = options.messages
      .filter((m) => m.role !== 'system')
      .map((m: AiMessage) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens ?? 2000,
      system: systemMessage,
      messages: userMessages,
      temperature: options.temperature ?? 0.7,
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const tokensUsed = (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0);

    return {
      content,
      tokensUsed,
      providerCostUsd: (tokensUsed / 1000) * this.costPer1kTokens,
      provider: 'anthropic',
      model: this.model,
    };
  }
}
