// Carga el .env antes de que se evaluen los metadatos de los modulos.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sintaxis de path-to-regexp v8 (Express 5): 'uploads/(.*)' quedo obsoleta.
  app.setGlobalPrefix('api', { exclude: ['uploads/{*path}'] });
  app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // 0.0.0.0: Render y cualquier contenedor enrutan desde fuera, no desde localhost.
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  console.log(`Hannah Store API escuchando en el puerto ${port}`);
}
bootstrap();
