import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Minha dúvida sobre este conteúdo...' })
  @IsString()
  @IsNotEmpty({ message: 'O conteúdo do comentário é obrigatório' })
  @MaxLength(1000, {
    message: 'O comentário deve ter no máximo 1000 caracteres',
  })
  content: string;
}
