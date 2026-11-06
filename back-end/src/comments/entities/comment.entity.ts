import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';

@Entity('comments')
export class Comment {
  @ApiProperty({ example: 1, description: 'Identificador único do comentário' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Minha dúvida sobre este conteúdo...' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ example: 1, description: 'Identificador da postagem' })
  @Column({ name: 'post_id' })
  postId: number;

  @ApiProperty({ example: 1, description: 'Identificador do autor' })
  @Column({ name: 'author_id' })
  authorId: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ApiProperty({ example: '2026-06-30T12:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-30T12:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
