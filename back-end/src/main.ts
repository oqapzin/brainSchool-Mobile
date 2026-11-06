import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rawCors = process.env.CORS_ORIGINS ?? '*';
  const corsOrigins =
    rawCors.trim() === '*'
      ? true
      : rawCors
          .split(',')
          .map((origin) => origin.trim())
          .filter(Boolean);
  app.enableCors({ origin: corsOrigins });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Blog API - Tech Challenge Fase 02')
    .setDescription(
      'API REST para plataforma de blogging dinâmico voltada a professores e alunos da rede pública de educação.',
    )
    .setVersion('1.0')
    .addTag('posts', 'Operações relacionadas às postagens do blog')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em: http://localhost:${port}`);
  console.log(`Documentação Swagger em: http://localhost:${port}/api-docs`);
}

bootstrap();
