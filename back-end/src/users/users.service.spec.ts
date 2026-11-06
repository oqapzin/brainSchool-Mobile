import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

const mockUser: User = {
  id: 1,
  username: 'professor',
  password: 'hashedpassword',
  role: 'professor',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('deve popular o banco se estiver vazio', async () => {
      mockRepository.count.mockResolvedValue(0);
      mockRepository.create.mockImplementation((dto) => dto);
      mockRepository.save.mockResolvedValue([]);

      await service.onModuleInit();

      expect(repository.count).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalled();
    });

    it('não deve popular o banco se já houver usuários', async () => {
      mockRepository.count.mockResolvedValue(2);

      await service.onModuleInit();

      expect(repository.count).toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findOneByUsername', () => {
    it('deve retornar um usuário pelo username', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOneByUsername('professor');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'professor' },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('deve criar e salvar um novo usuário', async () => {
      const dto = {
        username: 'newuser',
        password: 'password123',
        role: 'aluno',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'newuser' },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('deve lançar ConflictException se o username já existir', async () => {
      const dto = {
        username: 'professor',
        password: 'password123',
        role: 'aluno',
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });
});
