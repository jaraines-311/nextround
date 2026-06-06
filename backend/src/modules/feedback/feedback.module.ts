import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { AiModule } from '../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AiModule, CreditsModule],
  providers: [FeedbackService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
