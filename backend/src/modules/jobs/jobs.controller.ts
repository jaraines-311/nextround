import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a job description (AI-parsed)' })
  async create(@Request() req, @Body() dto: CreateJobDto) {
    return this.jobsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my saved jobs' })
  async findAll(@Request() req) {
    return this.jobsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.jobsService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.jobsService.remove(req.user.userId, id);
  }
}
