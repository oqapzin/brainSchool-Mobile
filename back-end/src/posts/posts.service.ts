import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    user?: { username: string },
  ): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user?.username ?? createPostDto.author,
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(`Post com id ${id} não foi encontrado`);
    }

    return post;
  }

  async search(term: string): Promise<Post[]> {
    if (!term || term.trim().length === 0) {
      return [];
    }

    return this.postsRepository
      .createQueryBuilder('post')
      .where('LOWER(post.title) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('LOWER(post.content) LIKE LOWER(:term)', {
        term: `%${term}%`,
      })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user?: { username: string },
  ): Promise<Post> {
    const post = await this.findOne(id);
    this.assertOwner(post, user);
    Object.assign(post, updatePostDto);
    if (user) post.author = user.username;
    return this.postsRepository.save(post);
  }

  async remove(id: number, user?: { username: string }): Promise<void> {
    const post = await this.findOne(id);
    this.assertOwner(post, user);
    await this.postsRepository.remove(post);
  }

  private assertOwner(post: Post, user?: { username: string }): void {
    if (user && post.author !== user.username)
      throw new ForbiddenException(
        'Somente o autor pode alterar esta postagem',
      );
  }
}
