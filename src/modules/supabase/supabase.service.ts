import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase; // للقراءة العامة (يستخدم anon key)
  private supabaseAdmin; // للعمليات الإدارية (يستخدم service role key)

  constructor() {
    // ✅ عميل للقراءة العامة (يخضع لـ RLS)
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
        },
      },
    );

    // ✅ عميل للعمليات الإدارية (يتجاوز RLS) - استخدم المفتاح السري
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY, // المفتاح السري الجديد
      {
        auth: {
          persistSession: false,
        },
      },
    );

    console.log('✅ Supabase clients initialized');
  }

  async uploadFile(
    file: Express.Multer.File,
    bucket: string,
    folderPath?: string,
  ): Promise<{ url: string; path: string }> {
    try {
      console.log('📤 Starting upload to Supabase...');

      // التحقق من وجود bucket
      await this.createBucketIfNotExists(bucket);

      if (!file.buffer) {
        throw new Error('File buffer is missing');
      }

      // تنظيف اسم الملف
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}-${cleanFileName}`;
      const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

      console.log('Uploading to path:', filePath);

      // ✅ استخدم supabaseAdmin (service role key) لتجاوز RLS
      const { data, error } = await this.supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      console.log('✅ Upload successful:', data);

      // ✅ استخدم supabase العادي للحصول على الرابط العام (هذا آمن)
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log('Public URL:', urlData.publicUrl);

      return {
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    bucket: string,
    folderPath?: string,
  ): Promise<Array<{ url: string; path: string }>> {
    try {
      console.log(`📤 Uploading ${files.length} files...`);

      const uploadPromises = files.map((file) =>
        this.uploadFile(file, bucket, folderPath),
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new BadRequestException(`Multiple upload failed: ${error.message}`);
    }
  }

  async deleteFile(filePath: string, bucket: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting file: ${filePath}`);

      // ✅ استخدم supabaseAdmin للحذف
      const { error } = await this.supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('✅ File deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }

  async deleteMultipleFiles(
    filePaths: string[],
    bucket: string = 'cases',
  ): Promise<void> {
    try {
      console.log(`🗑️ Deleting ${filePaths.length} files...`);

      // ✅ استخدم supabaseAdmin للحذف
      const { error } = await this.supabaseAdmin.storage
        .from(bucket)
        .remove(filePaths);

      if (error) {
        throw new Error(`Multiple delete failed: ${error.message}`);
      }

      console.log('✅ All files deleted successfully');
    } catch (error) {
      console.error('Multiple delete error:', error);
      throw new BadRequestException(`Multiple delete failed: ${error.message}`);
    }
  }

  async createBucketIfNotExists(bucketName: string): Promise<void> {
    try {
      console.log(`Checking bucket '${bucketName}'...`);

      // ✅ استخدم supabaseAdmin للتحقق من وجود bucket
      const { data: buckets, error: listError } =
        await this.supabaseAdmin.storage.listBuckets();

      if (listError) {
        throw new Error(`Failed to list buckets: ${listError.message}`);
      }

      const bucketExists = buckets?.some((b) => b.name === bucketName);

      if (!bucketExists) {
        console.log(`Creating bucket '${bucketName}'...`);

        // ✅ استخدم supabaseAdmin لإنشاء bucket
        const { error: createError } =
          await this.supabaseAdmin.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/*', 'video/*'],
            fileSizeLimit: 50 * 1024 * 1024, // 10MB
          });

        if (createError) {
          throw new Error(`Failed to create bucket: ${createError.message}`);
        }

        console.log(`✅ Bucket '${bucketName}' created`);
      } else {
        console.log(`✅ Bucket '${bucketName}' exists`);
      }
    } catch (error) {
      console.error('Bucket error:', error);
      throw error;
    }
  }
}
