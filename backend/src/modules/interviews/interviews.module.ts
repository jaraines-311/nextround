import { Module } from '@nestjs/common';
import { InterviewsService } from './interviews.service';
import { InterviewsController } from './interviews.controller';
import { AiModule } from '../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
  imports: [AiModule, CreditsModule, FeedbackModule],
  providers: [InterviewsService],
  controllers: [InterviewsController],
  exports: [InterviewsService],
})
export class InterviewsModule {}
