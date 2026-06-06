import { Controller, Post, Get, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResumeService } from './resume.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';

@ApiTags('resumes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post()
  @ApiOperation({ summary: 'Upload or paste a resume (AI-parsed)' })
  async create(@Request() req, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my resumes' })
  async findAll(@Request() req) {
    return this.resumeService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by ID' })
  async findOne(@Request() req, @Param('id') id: string) {
    return this.resumeService.findOne(req.user.userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a resume' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdateResumeDto) {
    return this.resumeService.update(req.user.userId, id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Set this resume as active' })
  async setActive(@Request() req, @Param('id') id: string) {
    return this.resumeService.setActive(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  async remove(@Request() req, @Param('id') id: string) {
    return this.resumeService.remove(req.user.userId, id);
  }
}
