import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Start a new interview session' })
  async create(@Request() req, @Body() dto: CreateInterviewDto) {
    return this.interviewsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my interview sessions' })
  async findAll(@Request() req, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.interviewsService.findAll(req.user.userId, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific interview session' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.interviewsService.findOne(req.user.userId, id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Submit an answer and receive the next question' })
  async submitAnswer(@Request() req, @Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    return this.interviewsService.submitAnswer(req.user.userId, id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark an interview session as complete' })
  async complete(@Request() req, @Param('id') id: string) {
    return this.interviewsService.complete(req.user.userId, id);
  }
}
