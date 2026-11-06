import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    postId: number,
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post com id ${postId} não foi encontrado`);
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(
        `Usuário com id ${userId} não foi encontrado`,
      );
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      postId,
      authorId: userId,
      post,
      author: user,
    });

    const savedComment = await this.commentsRepository.save(comment);
    return this.toPublicComment(savedComment);
  }

  async findByPost(postId: number): Promise<Comment[]> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post com id ${postId} não foi encontrado`);
    }

    const comments = await this.commentsRepository.find({
      where: { postId },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });

    return comments.map((comment) => this.toPublicComment(comment));
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: { author: true },
    });

    if (!comment) {
      throw new NotFoundException(`Comentário com id ${id} não foi encontrado`);
    }

    return this.toPublicComment(comment);
  }

  async update(
    id: number,
    updateCommentDto: UpdateCommentDto,
    user: { id: number; role: string },
  ): Promise<Comment> {
    const comment = await this.findOne(id);
    this.assertOwner(comment, user.id);
    Object.assign(comment, updateCommentDto);
    const savedComment = await this.commentsRepository.save(comment);
    return this.toPublicComment(savedComment);
  }

  async remove(id: number, user: { id: number; role: string }): Promise<void> {
    const comment = await this.findOne(id);
    if (user.role !== 'professor') this.assertOwner(comment, user.id);
    await this.commentsRepository.remove(comment);
  }

  private assertOwner(comment: Comment, userId: number): void {
    if (comment.authorId !== userId) {
      throw new ForbiddenException(
        'Somente o autor pode alterar este comentário',
      );
    }
  }

  private toPublicComment(comment: Comment): Comment {
    if (!comment.author) return comment;

    return {
      ...comment,
      author: {
        id: comment.author.id,
        username: comment.author.username,
        role: comment.author.role,
      } as User,
    };
  }
}
