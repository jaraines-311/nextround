import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { MockAiProvider } from './providers/mock.provider';

@Module({
  providers: [AiService, OpenAiProvider, AnthropicProvider, MockAiProvider],
  exports: [AiService],
})
export class AiModule {}
