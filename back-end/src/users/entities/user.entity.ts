import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from '../../comments/entities/comment.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: 1, description: 'Identificador único do usuário' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'professor1', description: 'Nome de usuário único' })
  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @ApiProperty({
    example: 'professor',
    description: 'Perfil de acesso do usuário (professor ou aluno)',
  })
  @Column({ type: 'varchar', length: 50 })
  role: string;

  @ApiProperty({ example: '2026-07-10T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.author)
  comments?: Comment[];
}
