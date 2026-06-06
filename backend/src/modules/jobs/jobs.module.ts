import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AiModule } from '../ai/ai.module';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [AiModule, CreditsModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
