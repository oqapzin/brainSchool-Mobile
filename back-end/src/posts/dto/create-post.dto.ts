import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Introdução à Matemática Financeira' })
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: 'Neste post vamos explorar os conceitos básicos de juros...',
  })
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo é obrigatório' })
  content: string;

  @ApiProperty({ example: 'Professor João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O autor é obrigatório' })
  @MaxLength(255)
  author: string;
}
