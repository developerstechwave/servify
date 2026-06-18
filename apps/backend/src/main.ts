import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import * as express from 'express';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist:            true,
      forbidNonWhitelisted: true,
      transform:            true,
    }),
  );

  app.enableCors({
    origin:      process.env.CLIENT_URL || 'http://localhost:4200',
    credentials: true,
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(join(process.cwd(), 'apps/backend/uploads')));

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3001);
  console.log(`Servify API running → http://localhost:${process.env.PORT || 3001}/api`);
}
bootstrap();
