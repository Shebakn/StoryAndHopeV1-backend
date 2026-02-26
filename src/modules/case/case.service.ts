/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { CaseResponseDto, CaseListResponseDto } from './dto/case-response.dto';
import { CaseStatus, MediaType } from '@prisma/client';
import { UploadMediaDto } from './dto/media.dto';
import { HomeResponseDto } from './dto/home-response.dto';

import sharp from 'sharp';

@Injectable()
export class CasesService {
  constructor(
    private prisma: PrismaService,
    private supabase: SupabaseService,
  ) {}

  // ========== CRUD الأساسية ==========

  async create(createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: createCaseDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const caseType = await this.prisma.caseType.findUnique({
      where: { id: createCaseDto.caseTypeId },
    });

    if (!caseType) {
      throw new NotFoundException('Case type not found');
    }

    const caseData = await this.prisma.case.create({
      data: {
        title: createCaseDto.title,
        shortDescription: createCaseDto.shortDescription,
        fullDescription: createCaseDto.fullDescription,
        goals: createCaseDto.goals || [],
        goalAmount: createCaseDto.goalAmount,
        location: createCaseDto.location,
        priority: createCaseDto.priority,
        isUrgent: createCaseDto.isUrgent || false,
        isFeatured: createCaseDto.isFeatured || false,
        status: createCaseDto.status || CaseStatus.DRAFT,
        beneficiaryName: createCaseDto.beneficiaryName,
        beneficiaryAge: createCaseDto.beneficiaryAge,
        beneficiaryStory: createCaseDto.beneficiaryStory,
        organization: {
          connect: { id: createCaseDto.organizationId },
        },
        caseType: {
          connect: { id: createCaseDto.caseTypeId },
        },
      },
      include: {
        coverMedia: true,
        media: true,
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    let resultCase = caseData;

    if (createCaseDto.categoryIds && createCaseDto.categoryIds.length > 0) {
      await this.prisma.caseCategory.createMany({
        data: createCaseDto.categoryIds.map((categoryId) => ({
          caseId: caseData.id,
          categoryId,
        })),
      });

      const updatedCase = await this.prisma.case.findUnique({
        where: { id: caseData.id },
        include: {
          coverMedia: true,
          media: true,
          caseCategories: {
            include: {
              category: true,
            },
          },
        },
      });

      if (updatedCase) {
        resultCase = updatedCase;
      }
    }

    return CaseResponseDto.fromEntity(resultCase);
  }

  async findAll(
    caseType?: string,
    status?: CaseStatus,
    priority?: string,
    isUrgent?: boolean,
    isFeatured?: boolean,
    organizationId?: string,
    categoryId?: string,
    search?: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<CaseListResponseDto> {
    const where: any = {};

    // فلترة نوع الحالة
    if (caseType) {
      where.caseType = {
        name: caseType.toUpperCase(),
      };
    }

    // فلترة الحالة enum
    if (status) {
      where.status = status;
    }

    // فلترة الأولوية
    if (priority) {
      where.priority = priority;
    }

    // فلترة الحالات العاجلة والمميزة
    if (isUrgent !== undefined) {
      where.isUrgent = isUrgent;
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // فلترة المؤسسة
    if (organizationId) {
      where.organizationId = organizationId;
    }

    // فلترة حسب التصنيفات
    if (categoryId) {
      where.caseCategories = {
        some: {
          categoryId: categoryId,
        },
      };
    }

    // البحث النصي
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
        { beneficiaryName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // استدعاء Prisma: الحصول على البيانات وعدد الحالات في نفس الوقت
    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        include: {
          coverMedia: true,
          media: {
            orderBy: { order: 'asc' },
          },
          caseCategories: {
            include: { category: true },
          },
          organization: {
            select: { id: true, name: true, logoUrl: true },
          },
          caseType: {
            select: { id: true, name: true },
          },
        },
        orderBy: [
          { createdAt: 'desc' }, // ترتيب حسب تاريخ الإضافة تنازلي
          { isUrgent: 'desc' }, // الحالات العاجلة أعلى
          { isFeatured: 'desc' }, // الحالات المميزة أعلى
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data: cases.map((c) => CaseResponseDto.fromEntity(c)),
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }

  async findOne(id: string): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        coverMedia: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        caseCategories: {
          include: {
            category: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
            website: true,
            logoUrl: true,
          },
        },
        caseType: {
          select: {
            id: true,
            name: true,
          },
        },
        donations: {
          where: {
            status: 'PAID',
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    return CaseResponseDto.fromEntity(caseData);
  }

  async update(
    id: string,
    updateCaseDto: UpdateCaseDto,
  ): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    if (updateCaseDto.categoryIds) {
      await this.prisma.caseCategory.deleteMany({
        where: { caseId: id },
      });

      if (updateCaseDto.categoryIds.length > 0) {
        await this.prisma.caseCategory.createMany({
          data: updateCaseDto.categoryIds.map((categoryId) => ({
            caseId: id,
            categoryId,
          })),
        });
      }
    }

    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        title: updateCaseDto.title,
        shortDescription: updateCaseDto.shortDescription,
        fullDescription: updateCaseDto.fullDescription,
        goals: updateCaseDto.goals,
        goalAmount: updateCaseDto.goalAmount,
        location: updateCaseDto.location,
        priority: updateCaseDto.priority,
        isUrgent: updateCaseDto.isUrgent,
        isFeatured: updateCaseDto.isFeatured,
        status: updateCaseDto.status,
        beneficiaryName: updateCaseDto.beneficiaryName,
        beneficiaryAge: updateCaseDto.beneficiaryAge,
        beneficiaryStory: updateCaseDto.beneficiaryStory,
        caseTypeId: updateCaseDto.caseTypeId,
      },
      include: {
        coverMedia: true,
        media: true,
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    return CaseResponseDto.fromEntity(updatedCase);
  }

  async remove(id: string): Promise<void> {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    const mediaPublicIds = caseData.media
      .map((m) => m.publicId)
      .filter((id) => id);

    if (mediaPublicIds.length > 0) {
      await this.supabase.deleteMultipleFiles(mediaPublicIds);
    }

    await this.prisma.case.delete({
      where: { id },
    });
  }

  // ========== وظائف الميديا ==========
  // ========== وظائف الميديا المتطورة ==========

  async uploadSingleMedia(
    id: string,
    file: Express.Multer.File,
    mediaData: UploadMediaDto,
  ): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    const folderPath = `cases/${id}`;

    const hasCover =
      caseData.coverMediaId !== null || caseData.media.length > 0;

    const shouldBeCover =
      mediaData?.isCover || (!hasCover && caseData.media.length === 0);

    let fileToUpload = file;
    let format = file.mimetype.split('/')[1];
    let mediaType: MediaType;

    // ==============================
    // IMAGE PROCESSING
    // ==============================
    if (file.mimetype.startsWith('image/')) {
      const processedBuffer = await sharp(file.buffer)
        .resize(1200, 900, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 85 })
        .toBuffer();

      fileToUpload = {
        ...file,
        buffer: processedBuffer,
        size: processedBuffer.length,
        mimetype: 'image/jpeg',
        originalname: file.originalname.replace(/\.[^/.]+$/, '.jpg'),
      };

      format = 'jpeg';
      mediaType = MediaType.IMAGE;
    }

    // ==============================
    // VIDEO PROCESSING
    // ==============================
    else if (file.mimetype.startsWith('video/')) {
      const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

      if (file.size > MAX_VIDEO_SIZE) {
        throw new BadRequestException('Video exceeds 50MB limit');
      }

      mediaType = MediaType.VIDEO;
    }

    // ==============================
    // UNSUPPORTED TYPE
    // ==============================
    else {
      throw new BadRequestException('Unsupported file type');
    }

    // ==============================
    // UPLOAD TO SUPABASE
    // ==============================
    const uploadResult = await this.supabase.uploadFile(
      fileToUpload,
      'cases',
      folderPath,
    );

    const mediaRecord = await this.prisma.caseMedia.create({
      data: {
        caseId: id,
        url: uploadResult.url,
        publicId: uploadResult.path,
        type: mediaType,
        format,
        bytes: fileToUpload.size,
        order: caseData.media.length,
      },
    });

    // ==============================
    // SET AS COVER IF NEEDED
    // ==============================
    if (shouldBeCover) {
      await this.prisma.case.update({
        where: { id },
        data: { coverMediaId: mediaRecord.id },
      });
    }

    return this.findOne(id);
  }
  // رفع عدة ملفات
  async uploadMedia(
    caseId: string,
    files: Express.Multer.File[],
    mediaDataArray: UploadMediaDto[],
  ): Promise<CaseResponseDto> {
    console.log('========== UPLOAD MULTIPLE MEDIA ==========');
    console.log('Case ID:', caseId);
    console.log('Number of files:', files.length);

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        media: true,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    // التحقق من تطابق عدد الملفات مع عدد البيانات (إذا وجدت)
    if (mediaDataArray.length > 0 && files.length !== mediaDataArray.length) {
      throw new BadRequestException('Number of files and metadata must match');
    }

    const folderPath = `cases/${caseId}`;
    const uploadResults = await this.supabase.uploadMultipleFiles(
      files,
      'cases',
      folderPath,
    );

    const mediaRecords = [];
    const existingMediaCount = caseData.media.length;

    // التحقق مما إذا كان هناك غلاف بالفعل
    const hasCover = caseData.coverMediaId !== null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const metadata = mediaDataArray[i] || {};
      const uploadResult = uploadResults[i];

      const mediaType = file.mimetype.startsWith('image/')
        ? MediaType.IMAGE
        : MediaType.VIDEO;

      // تحديد الترتيب
      const order =
        metadata.order !== undefined ? metadata.order : existingMediaCount + i;

      // تحديد ما إذا كان هذا الملف سيكون الغلاف
      const shouldBeCover =
        metadata.isCover || (!hasCover && i === 0 && mediaRecords.length === 0);

      const mediaRecord = await this.prisma.caseMedia.create({
        data: {
          caseId,
          url: uploadResult.url,
          publicId: uploadResult.path,
          type: mediaType,
          format: file.mimetype.split('/')[1],
          bytes: file.size,
          order: order,
        },
      });

      mediaRecords.push(mediaRecord);

      // تعيين كغلاف إذا لزم الأمر
      if (shouldBeCover) {
        await this.prisma.case.update({
          where: { id: caseId },
          data: {
            coverMediaId: mediaRecord.id,
          },
        });
        console.log(`✅ File ${i + 1} set as cover`);
      }
    }

    console.log(`✅ ${mediaRecords.length} files uploaded successfully`);
    return this.findOne(caseId);
  }

  // إعادة ترتيب الميديا
  async reorderMedia(
    caseId: string,
    mediaOrder: { id: string; order: number }[],
  ): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    // تحديث ترتيب كل ملف
    const updatePromises = mediaOrder.map(({ id, order }) =>
      this.prisma.caseMedia.update({
        where: { id },
        data: { order },
      }),
    );

    await Promise.all(updatePromises);

    return this.findOne(caseId);
  }

  // تعيين صورة كغطاء
  async setCoverMedia(
    caseId: string,
    mediaId: string,
  ): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    const media = await this.prisma.caseMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media || media.caseId !== caseId) {
      throw new NotFoundException('Media not found for this case');
    }

    await this.prisma.case.update({
      where: { id: caseId },
      data: {
        coverMediaId: mediaId,
      },
    });

    return this.findOne(caseId);
  }

  // حذف ملف
  async deleteMedia(caseId: string, mediaId: string): Promise<CaseResponseDto> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        media: true,
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    const media = await this.prisma.caseMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media || media.caseId !== caseId) {
      throw new NotFoundException('Media not found for this case');
    }

    // حذف من Supabase
    if (media.publicId) {
      await this.supabase.deleteFile(media.publicId, 'cases');
    }

    // حذف من قاعدة البيانات
    await this.prisma.caseMedia.delete({
      where: { id: mediaId },
    });

    // إذا كان الملف المحذوف هو الغلاف، قم بتعيين غلاف جديد
    if (caseData.coverMediaId === mediaId) {
      const remainingMedia = await this.prisma.caseMedia.findMany({
        where: { caseId },
        orderBy: { order: 'asc' },
      });

      if (remainingMedia.length > 0) {
        // تعيين أول ملف كغلاف جديد
        await this.prisma.case.update({
          where: { id: caseId },
          data: {
            coverMediaId: remainingMedia[0].id,
          },
        });
        console.log('✅ New cover media set automatically');
      } else {
        // لا يوجد ملفات متبقية، إزالة الغلاف
        await this.prisma.case.update({
          where: { id: caseId },
          data: {
            coverMediaId: null,
          },
        });
      }
    }

    return this.findOne(caseId);
  }
  // ========== وظائف إضافية ==========

  async updateRaisedAmount(caseId: string, amount: number): Promise<void> {
    await this.prisma.case.update({
      where: { id: caseId },
      data: {
        raisedAmount: {
          increment: amount,
        },
      },
    });

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
    });

    if (caseData && caseData.raisedAmount >= caseData.goalAmount) {
      await this.prisma.case.update({
        where: { id: caseId },
        data: {
          status: CaseStatus.COMPLETED,
        },
      });
    }
  }

  async getCasesByType(caseType: string): Promise<CaseResponseDto[]> {
    const cases = await this.prisma.case.findMany({
      where: {
        caseType: {
          name: caseType.toUpperCase(),
        },
        status: CaseStatus.ACTIVE,
      },
      include: {
        coverMedia: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { isUrgent: 'desc' },
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 20,
    });

    return cases.map((c) => CaseResponseDto.fromEntity(c));
  }

  async getUrgentCases(): Promise<CaseResponseDto[]> {
    const cases = await this.prisma.case.findMany({
      where: {
        isUrgent: true,
        status: CaseStatus.ACTIVE,
      },
      include: {
        coverMedia: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return cases.map((c) => CaseResponseDto.fromEntity(c));
  }

  async getFeaturedCases(): Promise<CaseResponseDto[]> {
    const cases = await this.prisma.case.findMany({
      where: {
        isFeatured: true,
        status: CaseStatus.ACTIVE,
      },
      include: {
        coverMedia: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return cases.map((c) => CaseResponseDto.fromEntity(c));
  }

  async getStats(): Promise<any> {
    const [
      totalCases,
      activeCases,
      completedCases,
      urgentCases,
      totalRaised,
      casesByType,
    ] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({ where: { status: CaseStatus.ACTIVE } }),
      this.prisma.case.count({ where: { status: CaseStatus.COMPLETED } }),
      this.prisma.case.count({
        where: { isUrgent: true, status: CaseStatus.ACTIVE },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.caseType.findMany({
        include: {
          _count: {
            select: {
              cases: {
                where: { status: CaseStatus.ACTIVE },
              },
            },
          },
        },
      }),
    ]);

    return {
      totalCases,
      activeCases,
      completedCases,
      urgentCases,
      totalRaised: totalRaised._sum.amount || 0,
      casesByType: casesByType.map((ct) => ({
        type: ct.name,
        count: ct._count.cases,
      })),
    };
  }

  async searchCases(
    query: string,
    filters?: {
      caseType?: string;
      categoryId?: string;
      priority?: string;
      minGoal?: number;
      maxGoal?: number;
      location?: string;
    },
    limit: number = 10,
    offset: number = 0,
  ): Promise<CaseListResponseDto> {
    const where: any = {
      status: CaseStatus.ACTIVE,
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { shortDescription: { contains: query, mode: 'insensitive' } },
        { fullDescription: { contains: query, mode: 'insensitive' } },
        { beneficiaryName: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (filters) {
      if (filters.caseType) {
        where.caseType = {
          name: filters.caseType.toUpperCase(),
        };
      }

      if (filters.categoryId) {
        where.caseCategories = {
          some: {
            categoryId: filters.categoryId,
          },
        };
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      if (filters.minGoal !== undefined || filters.maxGoal !== undefined) {
        where.goalAmount = {};
        if (filters.minGoal !== undefined) {
          where.goalAmount.gte = filters.minGoal;
        }
        if (filters.maxGoal !== undefined) {
          where.goalAmount.lte = filters.maxGoal;
        }
      }
    }

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        include: {
          coverMedia: true,
          media: {
            orderBy: {
              order: 'asc',
            },
          },
          caseCategories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: [
          { isUrgent: 'desc' },
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data: cases.map((c) => CaseResponseDto.fromEntity(c)),
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    };
  }

  async getSimilarCases(
    caseId: string,
    limit: number = 4,
  ): Promise<CaseResponseDto[]> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Case not found');
    }

    const categoryIds = caseData.caseCategories.map((cc) => cc.categoryId);

    const similarCases = await this.prisma.case.findMany({
      where: {
        id: { not: caseId },
        status: CaseStatus.ACTIVE,
        caseCategories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
      },
      include: {
        coverMedia: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        caseCategories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { isUrgent: 'desc' },
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    });

    return similarCases.map((c) => CaseResponseDto.fromEntity(c));
  }

  // src/modules/case/case.service.ts
  // أضف هذه الدالة

  async getHomeData(): Promise<HomeResponseDto> {
    // 🔍 ===== تشخيص قاعدة البيانات =====
    console.log('🔍 ===== DIAGNOSTIC: Checking database =====');

    // جلب جميع الحالات للتشخيص
    const allCases = await this.prisma.case.findMany({
      include: {
        caseType: true,
      },
    });

    console.log(`📊 Total cases in DB: ${allCases.length}`);
    console.log('📋 Case types distribution:');

    const stories = allCases.filter((c) => c.caseType?.name === 'STORY');
    const appeals = allCases.filter((c) => c.caseType?.name === 'APPEAL');
    const others = allCases.filter(
      (c) => c.caseType?.name !== 'STORY' && c.caseType?.name !== 'APPEAL',
    );

    console.log(`- STORY cases: ${stories.length}`);
    console.log(`- APPEAL cases: ${appeals.length}`);
    console.log(`- Other cases: ${others.length}`);

    console.log('📋 First 3 cases:');
    allCases.slice(0, 3).forEach((c, i) => {
      console.log(
        `  ${i + 1}. ID: ${c.id}, Title: ${c.title}, Type: ${c.caseType?.name}`,
      );
    });

    console.log('🔍 ===== END DIAGNOSTIC =====');

    // 1. أعلى 4 قصص نشطة حسب المبلغ المجموع
    const topStories = await this.prisma.case.findMany({
      where: {
        caseType: { name: 'STORY' },
        status: 'ACTIVE',
      },
      orderBy: { raisedAmount: 'desc' },
      take: 4,
      include: {
        coverMedia: true,
        media: {
          orderBy: { order: 'asc' },
        },
        caseType: true,
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(`📊 topStories found: ${topStories.length}`);

    // 2. أعلى 4 مناشدات نشطة حسب المبلغ المجموع
    const topAppeals = await this.prisma.case.findMany({
      where: {
        caseType: { name: 'APPEAL' },
        status: 'ACTIVE',
      },
      orderBy: { raisedAmount: 'desc' },
      take: 4,
      include: {
        coverMedia: true,
        media: {
          orderBy: { order: 'asc' },
        },
        caseType: true,
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(`📊 topAppeals found: ${topAppeals.length}`);

    // 3. آخر 4 قصص مكتملة
    const recentStories = await this.prisma.case.findMany({
      where: {
        caseType: { name: 'STORY' },
        status: 'COMPLETED',
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        coverMedia: true,
        media: {
          orderBy: { order: 'asc' },
        },
        caseType: true,
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(`📊 recentStories found: ${recentStories.length}`);

    // 4. آخر 4 مناشدات مكتملة
    const recentAppeals = await this.prisma.case.findMany({
      where: {
        caseType: { name: 'APPEAL' },
        status: 'COMPLETED',
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
      include: {
        coverMedia: true,
        media: {
          orderBy: { order: 'asc' },
        },
        caseType: true,
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    console.log(`📊 recentAppeals found: ${recentAppeals.length}`);

    // 5. الإحصائيات
    const [totalCases, donationsAggregate, totalBeneficiaries] =
      await Promise.all([
        this.prisma.case.count({
          where: { status: 'ACTIVE' },
        }),
        this.prisma.donation.aggregate({
          where: { status: 'PAID' },
          _sum: { amount: true },
        }),
        this.prisma.case.count({
          where: {
            status: 'ACTIVE',
            beneficiaryName: { not: null },
          },
        }),
      ]);

    // تحويل Decimal إلى number
    const totalDonationsValue = donationsAggregate._sum.amount
      ? Number(donationsAggregate._sum.amount)
      : 0;

    console.log(`📊 Stats - Total Active Cases: ${totalCases}`);
    console.log(`📊 Stats - Total Donations: ${totalDonationsValue}`);
    console.log(`📊 Stats - Total Beneficiaries: ${totalBeneficiaries}`);

    return {
      topStories: topStories.map((c) => CaseResponseDto.fromEntity(c)),
      topAppeals: topAppeals.map((c) => CaseResponseDto.fromEntity(c)),
      recentStories: recentStories.map((c) => CaseResponseDto.fromEntity(c)),
      recentAppeals: recentAppeals.map((c) => CaseResponseDto.fromEntity(c)),
      stats: {
        totalCases,
        totalDonations: totalDonationsValue,
        totalBeneficiaries,
      },
    };
  }
}
