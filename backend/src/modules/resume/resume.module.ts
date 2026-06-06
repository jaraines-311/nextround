import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { AiModule } from '../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AiModule, CreditsModule],
  providers: [ResumeService],
  controllers: [ResumeController],
  exports: [ResumeService],
})
export class ResumeModule {}
