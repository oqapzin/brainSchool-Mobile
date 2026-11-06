import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';

const mockComment = {
  id: 1,
  content: 'Comentário inicial',
  postId: 10,
  authorId: 20,
} as Comment;

const mockPost = { id: 10 } as Post;
const mockUser = { id: 20 } as User;

describe('CommentsService', () => {
  let service: CommentsService;
  let commentsRepository: jest.Mocked<Repository<Comment>>;
  let postsRepository: jest.Mocked<Repository<Post>>;
  let usersRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Post),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(User),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(CommentsService);
    commentsRepository = module.get(getRepositoryToken(Comment));
    postsRepository = module.get(getRepositoryToken(Post));
    usersRepository = module.get(getRepositoryToken(User));
  });

  it('deve criar comentário para post e usuário existentes', async () => {
    postsRepository.findOne.mockResolvedValue(mockPost);
    usersRepository.findOne.mockResolvedValue(mockUser);
    commentsRepository.create.mockReturnValue(mockComment);
    commentsRepository.save.mockResolvedValue(mockComment);

    const result = await service.create(
      10,
      { content: 'Comentário inicial' },
      20,
    );

    expect(commentsRepository.create).toHaveBeenCalledWith({
      content: 'Comentário inicial',
      postId: 10,
      authorId: 20,
      post: mockPost,
      author: mockUser,
    });
    expect(result).toEqual(mockComment);
  });

  it('deve rejeitar comentário em post inexistente', async () => {
    postsRepository.findOne.mockResolvedValue(null);

    await expect(service.create(999, { content: 'Teste' }, 20)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve listar comentários ordenados por data', async () => {
    postsRepository.findOne.mockResolvedValue(mockPost);
    commentsRepository.find.mockResolvedValue([mockComment]);

    const result = await service.findByPost(10);

    expect(result).toEqual([mockComment]);
    expect(commentsRepository.find).toHaveBeenCalledWith({
      where: { postId: 10 },
      relations: { author: true },
      order: { createdAt: 'ASC' },
    });
  });

  it('deve impedir alteração por usuário diferente do autor', async () => {
    commentsRepository.findOne.mockResolvedValue(mockComment);

    await expect(
      service.update(1, { content: 'Alterado' }, { id: 99, role: 'aluno' }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve remover comentário do próprio autor', async () => {
    commentsRepository.findOne.mockResolvedValue(mockComment);
    commentsRepository.remove.mockResolvedValue(mockComment);

    await service.remove(1, { id: 20, role: 'aluno' });

    expect(commentsRepository.remove).toHaveBeenCalledWith(mockComment);
  });

  it('deve permitir que um docente exclua comentário de outro usuário', async () => {
    commentsRepository.findOne.mockResolvedValue(mockComment);
    commentsRepository.remove.mockResolvedValue(mockComment);

    await service.remove(1, { id: 99, role: 'professor' });

    expect(commentsRepository.remove).toHaveBeenCalledWith(mockComment);
  });
});
