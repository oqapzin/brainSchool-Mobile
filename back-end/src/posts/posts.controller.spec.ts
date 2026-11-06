import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
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

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    search: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockService }],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('create: deve criar uma postagem', async () => {
    const dto = {
      title: mockPost.title,
      content: mockPost.content,
      author: mockPost.author,
    };
    mockService.create.mockResolvedValue(mockPost);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockPost);
  });

  it('findAll: deve retornar todas as postagens', async () => {
    mockService.findAll.mockResolvedValue([mockPost]);

    const result = await controller.findAll();

    expect(result).toEqual([mockPost]);
  });

  it('search: deve retornar postagens filtradas pelo termo', async () => {
    mockService.search.mockResolvedValue([mockPost]);

    const result = await controller.search('matemática');

    expect(service.search).toHaveBeenCalledWith('matemática');
    expect(result).toEqual([mockPost]);
  });

  it('findOne: deve retornar uma postagem pelo id', async () => {
    mockService.findOne.mockResolvedValue(mockPost);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockPost);
  });

  it('update: deve atualizar uma postagem', async () => {
    const dto = { title: 'Novo título' };
    mockService.update.mockResolvedValue({ ...mockPost, ...dto });

    const result = await controller.update(1, dto);

    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result.title).toEqual('Novo título');
  });

  it('remove: deve remover uma postagem', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(1);

    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
