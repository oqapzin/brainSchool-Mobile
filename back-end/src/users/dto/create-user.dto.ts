import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'professor1', description: 'Nome de usuário' })
  @IsString()
  @IsNotEmpty({ message: 'O nome de usuário é obrigatório' })
  username: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({
    example: 'aluno',
    enum: ['professor', 'aluno'],
    description: 'Perfil do usuário (professor ou aluno)',
  })
  @IsOptional()
  @IsString()
  @IsIn(['professor', 'aluno'], {
    message: 'O perfil deve ser professor ou aluno',
  })
  role?: string;
}

