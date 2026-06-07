import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CandidateProfileModule } from './modules/candidate-profile/candidate-profile.module';
import { ResumeModule } from './modules/resume/resume.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { AiModule } from './modules/ai/ai.module';
import { BillingModule } from './modules/billing/billing.module';
import { CreditsModule } from './modules/credits/credits.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'medium', ttl: 60000, limit: 200 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    CandidateProfileModule,
    ResumeModule,
    JobsModule,
    InterviewsModule,
    FeedbackModule,
    AiModule,
    BillingModule,
    CreditsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
