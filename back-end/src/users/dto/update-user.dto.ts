import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'professor_editado', description: 'Nome de usuário' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'novaSenha123', description: 'Nova senha (opcional)' })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    example: 'professor',
    enum: ['professor', 'aluno'],
    description: 'Perfil de acesso do usuário',
  })
  @IsOptional()
  @IsString()
  @IsIn(['professor', 'aluno'], {
    message: 'O perfil deve ser professor ou aluno',
  })
  role?: string;
}
