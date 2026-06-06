import { Controller, Post, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('sessions/:sessionId/generate')
  @ApiOperation({ summary: 'Generate AI feedback for a completed interview session' })
  async generate(@Request() req, @Param('sessionId') sessionId: string) {
    return this.feedbackService.generate(req.user.userId, sessionId);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get feedback for a session' })
  async findBySession(@Request() req, @Param('sessionId') sessionId: string) {
    return this.feedbackService.findBySession(req.user.userId, sessionId);
  }

  @Get()
  @ApiOperation({ summary: 'List my feedback reports' })
  async findAll(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.feedbackService.findAll(req.user.userId, +page, +limit);
  }
}
