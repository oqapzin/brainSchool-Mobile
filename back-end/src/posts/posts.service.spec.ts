import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

const mockPost: Post = {
  id: 1,
  title: 'Introdução à Matemática Financeira',
  content: 'Conteúdo sobre juros simples e compostos',
  author: 'Professor João Silva',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([mockPost]),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar e salvar uma nova postagem', async () => {
      const dto = {
        title: mockPost.title,
        content: mockPost.content,
        author: mockPost.author,
      };
      mockRepository.create.mockReturnValue(mockPost);
      mockRepository.save.mockResolvedValue(mockPost);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(mockPost);
      expect(result).toEqual(mockPost);
    });
  });

  describe('findAll', () => {
    it('deve retornar uma lista de postagens', async () => {
      mockRepository.find.mockResolvedValue([mockPost]);

      const result = await service.findAll();

      expect(result).toEqual([mockPost]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('deve retornar uma postagem existente', async () => {
      mockRepository.findOne.mockResolvedValue(mockPost);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPost);
    });

    it('deve lançar NotFoundException quando a postagem não existir', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('deve retornar postagens que correspondem ao termo buscado', async () => {
      const result = await service.search('matemática');

      expect(result).toEqual([mockPost]);
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('post');
    });

    it('deve retornar array vazio quando o termo de busca for vazio', async () => {
      const result = await service.search('');

      expect(result).toEqual([]);
      expect(repository.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar uma postagem existente', async () => {
      const dto = { title: 'Título atualizado' };
      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.save.mockResolvedValue({ ...mockPost, ...dto });

      const result = await service.update(1, dto);

      expect(result.title).toEqual('Título atualizado');
    });

    it('deve lançar NotFoundException ao atualizar postagem inexistente', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma postagem existente', async () => {
      mockRepository.findOne.mockResolvedValue(mockPost);
      mockRepository.remove.mockResolvedValue(mockPost);

      await service.remove(1);

      expect(repository.remove).toHaveBeenCalledWith(mockPost);
    });

    it('deve lançar NotFoundException ao remover postagem inexistente', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
