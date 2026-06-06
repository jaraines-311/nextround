import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CandidateProfileService } from './candidate-profile.service';
import { UpdateCandidateProfileDto } from './dto/update-candidate-profile.dto';

@ApiTags('candidate-profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('candidate-profile')
export class CandidateProfileController {
  constructor(private readonly candidateProfileService: CandidateProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get my candidate profile' })
  async getProfile(@Request() req) {
    return this.candidateProfileService.findByUser(req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update my candidate profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateCandidateProfileDto) {
    return this.candidateProfileService.update(req.user.userId, dto);
  }
}
