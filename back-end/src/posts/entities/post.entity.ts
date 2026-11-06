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

@Entity('posts')
export class Post {
  @ApiProperty({ example: 1, description: 'Identificador único do post' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Introdução à Matemática Financeira' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({
    example: 'Neste post vamos explorar os conceitos básicos de juros...',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 'Professor João Silva' })
  @Column({ type: 'varchar', length: 255 })
  author: string;

  @ApiProperty({ example: '2026-06-30T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-30T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];
}
