import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';

const mockComment = { id: 1, postId: 10, authorId: 20 } as Comment;

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findByPost: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(CommentsController);
    service = module.get(CommentsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve criar comentário usando o usuário autenticado', async () => {
    service.create.mockResolvedValue(mockComment);

    const result = await controller.create(
      10,
      { content: 'Comentário' },
      { user: { id: 20, role: 'aluno' } },
    );

    expect(service.create).toHaveBeenCalledWith(
      10,
      { content: 'Comentário' },
      20,
    );
    expect(result).toEqual(mockComment);
  });

  it('deve listar comentários do post', async () => {
    service.findByPost.mockResolvedValue([mockComment]);

    const result = await controller.findByPost(10);

    expect(service.findByPost).toHaveBeenCalledWith(10);
    expect(result).toEqual([mockComment]);
  });

  it('deve atualizar comentário usando o usuário autenticado', async () => {
    service.update.mockResolvedValue(mockComment);

    await controller.update(
      1,
      { content: 'Atualizado' },
      { user: { id: 20, role: 'aluno' } },
    );

    expect(service.update).toHaveBeenCalledWith(
      1,
      { content: 'Atualizado' },
      { id: 20, role: 'aluno' },
    );
  });

  it('deve excluir comentário usando o usuário autenticado', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(1, { user: { id: 20, role: 'aluno' } });

    expect(service.remove).toHaveBeenCalledWith(1, { id: 20, role: 'aluno' });
  });
});
