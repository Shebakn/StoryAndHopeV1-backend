/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  BadRequestException,
  UploadedFile,
  UploadedFiles,
  Req,
  Patch,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { CasesService } from './case.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UploadMediaDto } from './dto/media.dto';
import { CaseStatus, MediaType } from '@prisma/client';
import { multerConfig } from '../../config/multer.config';
import { HomeResponseDto } from './dto/home-response.dto';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  // ========== CRUD الأساسية ==========

  @Post()
  async create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Get('home')
  async getHomeData(): Promise<HomeResponseDto> {
    return this.casesService.getHomeData();
  }

  @Get()
  async findAll(
    @Query('caseType') caseType?: string,
    @Query('status') status?: string, // نصي من query
    @Query('priority') priority?: string,
    @Query('isUrgent') isUrgent?: string,
    @Query('isFeatured') isFeatured?: string,
    @Query('organizationId') organizationId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    // تحويل status النصي إلى enum
    let statusEnum: CaseStatus | undefined;
    if (status) {
      switch (status.toLowerCase()) {
        case 'completed':
          statusEnum = CaseStatus.COMPLETED;
          break;
        case 'active': // إذا جاء "pending" أو "in_progress" نعتبرها PENDING
          statusEnum = CaseStatus.ACTIVE; // لا يوجد حالة "in_progress" في الـ enum، نفترض أنها PENDING
          break;
        default:
          throw new BadRequestException(`Invalid status value: ${status}`);
      }
    }

    return this.casesService.findAll(
      caseType,
      statusEnum, // الآن النوع صحيح CaseStatus | undefined
      priority,
      isUrgent === 'true',
      isFeatured === 'true',
      organizationId,
      categoryId,
      search,
      limit,
      offset,
    );
  }

  @Get('stats')
  async getStats() {
    return this.casesService.getStats();
  }

  @Get('type/:caseType')
  async getByType(@Param('caseType') caseType: string) {
    return this.casesService.getCasesByType(caseType);
  }

  @Get('urgent')
  async getUrgent() {
    return this.casesService.getUrgentCases();
  }

  @Get('featured')
  async getFeatured() {
    return this.casesService.getFeaturedCases();
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('caseType') caseType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('priority') priority?: string,
    @Query('minGoal') minGoal?: number,
    @Query('maxGoal') maxGoal?: number,
    @Query('location') location?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.casesService.searchCases(
      query,
      { caseType, categoryId, priority, minGoal, maxGoal, location },
      limit,
      offset,
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.casesService.findOne(id);
  }

  @Get(':id/similar')
  async getSimilar(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit?: number,
  ) {
    return this.casesService.getSimilarCases(id, limit);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCaseDto: UpdateCaseDto,
  ) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.casesService.remove(id);
  }

  // ========== وظائف الميديا ==========

  // رفع ملف واحد
  @Post(':id/media')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() mediaData: UploadMediaDto,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const mediaType = file.mimetype.startsWith('image/')
      ? MediaType.IMAGE
      : MediaType.VIDEO;

    return this.casesService.uploadSingleMedia(id, file, {
      ...mediaData,
      type: mediaType,
    });
  }

  // رفع عدة ملفات في وقت واحد
  @Post(':id/media/bulk')
  @UseInterceptors(FilesInterceptor('files', 20, multerConfig)) // حد أقصى 20 ملف
  async uploadMultipleMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: Request,
  ) {
    console.log('========== UPLOAD MULTIPLE MEDIA REQUEST ==========');
    console.log('1. Headers Content-Type:', req.headers['content-type']);
    console.log('2. Files received:', files?.length || 0);
    console.log('3. Body received:', body);
    console.log('===================================================');

    if (!files || files.length === 0) {
      throw new BadRequestException({
        message: 'No files uploaded',
        tip: 'Make sure you are sending form-data with field name "files"',
      });
    }

    // محاولة تحويل mediaData إذا كان مرسل كـ JSON string
    let mediaDataArray: any[] = [];
    if (body.mediaData) {
      try {
        mediaDataArray =
          typeof body.mediaData === 'string'
            ? JSON.parse(body.mediaData)
            : body.mediaData;
      } catch (e) {
        console.error('Error parsing mediaData:', e);
      }
    }

    // تجهيز البيانات لكل ملف
    const uploadDataArray = files.map((file, index) => {
      const mediaType = file.mimetype.startsWith('image/')
        ? MediaType.IMAGE
        : MediaType.VIDEO;

      return {
        type: mediaType,
        order: mediaDataArray[index]?.order || index,
        isCover: mediaDataArray[index]?.isCover || false,
      };
    });

    return this.casesService.uploadMedia(id, files, uploadDataArray);
  }

  // تعيين صورة كغطاء
  @Put(':id/media/:mediaId/cover')
  async setCoverMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.casesService.setCoverMedia(id, mediaId);
  }

  // حذف ملف
  @Delete(':id/media/:mediaId')
  async deleteMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.casesService.deleteMedia(id, mediaId);
  }

  // إعادة ترتيب الميديا
  @Post(':id/media/reorder')
  async reorderMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { mediaOrder: { id: string; order: number }[] },
  ) {
    return this.casesService.reorderMedia(id, body.mediaOrder);
  }

  // ========== وظائف التبرعات ==========

  @Post(':id/donate')
  async updateRaisedAmount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ) {
    await this.casesService.updateRaisedAmount(id, amount);
    return { message: 'Donation recorded successfully' };
  }

  // Endpoint تجريبي
  @Post('test-upload')
  @UseInterceptors(FileInterceptor('file'))
  async testUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Req() req: Request,
  ) {
    console.log('========== TEST UPLOAD ==========');
    console.log('Content-Type:', req.headers['content-type']);
    console.log(
      'File:',
      file
        ? {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          }
        : '❌ No file',
    );
    console.log('Body:', body);
    console.log('================================');

    if (!file) {
      return {
        success: false,
        error: 'No file received',
        receivedHeaders: req.headers['content-type'],
      };
    }

    return {
      success: true,
      message: 'File received successfully',
      file: {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      body: body,
    };
  }
}
