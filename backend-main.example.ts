// NestJS Backend - main.ts
// Copy code này vào file src/main.ts của backend

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ CORS Configuration - QUAN TRỌNG!
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global prefix (nếu bạn đang dùng /api prefix)
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3201;
  await app.listen(port);
  
  console.log(`🚀 Server is running on http://localhost:${port}`);
  console.log(`✅ CORS enabled for: http://localhost:5173`);
}

bootstrap();
