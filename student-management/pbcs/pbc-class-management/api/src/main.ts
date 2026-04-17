// AI-GENERATED
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','), credentials: true });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Class Management API').setVersion('1.0.0').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚀 Class Management API running on: http://localhost:${port}`);
}
bootstrap();
