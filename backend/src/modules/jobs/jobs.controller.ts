import { Controller, Post, Get, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateJobInterviewDto } from './dto/create-job-interview.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a job prospect (AI-parsed)' })
  async create(@Request() req, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user.userId, dto);
  }

  @Post('fetch-url')
  @ApiOperation({ summary: 'Fetch and parse a job posting from a URL' })
  @ApiBody({ schema: { properties: { url: { type: 'string' } } } })
  async fetchUrl(@Body('url') url: string) {
    return this.jobsService.fetchFromUrl(url);
  }

  @Get()
  @ApiOperation({ summary: 'List job prospects with scheduled interviews' })
  async findAll(@Request() req) {
    return this.jobsService.findAllWithInterviews(req.user.userId);
  }

  @Get('upcoming-interviews')
  @ApiOperation({ summary: 'Get upcoming scheduled interviews for dashboard' })
  async upcomingInterviews(@Request() req) {
    return this.jobsService.getUpcomingInterviews(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job prospect with interviews' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.jobsService.findOneWithInterviews(req.user.userId, id);
  }

  @Get(':id/analysis')
  @ApiOperation({ summary: 'Get persisted resume match analysis for a job' })
  async getJobAnalysis(@Request() req, @Param('id') id: string) {
    return this.jobsService.getJobAnalysis(req.user.userId, id);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Run AI resume-to-job match analysis (300 credits)' })
  async analyzeJobMatch(@Request() req, @Param('id') id: string) {
    return this.jobsService.analyzeJobMatch(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job prospect' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job prospect' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.jobsService.remove(req.user.userId, id);
  }

  // ── Job interview events ──────────────────────────────────────────────────

  @Post(':id/interviews')
  @ApiOperation({ summary: 'Add a scheduled interview to a job prospect' })
  async createInterview(@Request() req, @Param('id') id: string, @Body() dto: CreateJobInterviewDto) {
    return this.jobsService.createInterview(req.user.userId, id, dto);
  }

  @Patch('interviews/:interviewId')
  @ApiOperation({ summary: 'Update a job interview event' })
  async updateInterview(@Request() req, @Param('interviewId') interviewId: string, @Body() dto: CreateJobInterviewDto) {
    return this.jobsService.updateInterview(req.user.userId, interviewId, dto);
  }

  @Delete('interviews/:interviewId')
  @ApiOperation({ summary: 'Delete a job interview event' })
  async deleteInterview(@Request() req, @Param('interviewId') interviewId: string) {
    return this.jobsService.deleteInterview(req.user.userId, interviewId);
  }
}
