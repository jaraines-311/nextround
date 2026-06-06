import { Module } from '@nestjs/common';
import { CandidateProfileService } from './candidate-profile.service';
import { CandidateProfileController } from './candidate-profile.controller';

@Module({
  providers: [CandidateProfileService],
  controllers: [CandidateProfileController],
  exports: [CandidateProfileService],
})
export class CandidateProfileModule {}
