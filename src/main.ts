import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // تفعيل CORS - الطريقة المباشرة
  app.enableCors({
    origin: true,
    credentials: true, // للسماح بإرسال cookies والتوكن
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: false,
    }),
  );

  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Server running on http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
}
bootstrap();
