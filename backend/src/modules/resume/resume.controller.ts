import { Controller, Post, Get, Put, Patch, Delete, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a resume from pasted text (AI-parsed)' })
  async create(@Request() req, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(req.user.userId, dto);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a resume file (PDF, DOCX, TXT) — text extracted automatically' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async upload(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.resumeService.createFromFile(req.user.userId, file, name);
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
