import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

const mockUser: User = {
  id: 1,
  username: 'professor',
  password: 'hashedpassword',
  role: 'professor',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOneByUsername: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('deve retornar dados do usuário (sem a senha) se a senha estiver correta', async () => {
      const password = 'senha123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userWithRealHash = { ...mockUser, password: hashedPassword };

      mockUsersService.findOneByUsername.mockResolvedValue(userWithRealHash);

      const result = await service.validateUser('professor', password);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      if (!result) throw new Error('Usuário válido esperado');
      expect(result.username).toBe('professor');
      expect((result as any).password).toBeUndefined();
    });

    it('deve retornar null se a senha estiver incorreta', async () => {
      const password = 'senha123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userWithRealHash = { ...mockUser, password: hashedPassword };

      mockUsersService.findOneByUsername.mockResolvedValue(userWithRealHash);

      const result = await service.validateUser('professor', 'senha_errada');

      expect(result).toBeNull();
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      const result = await service.validateUser('inexistente', 'senha123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('deve retornar access_token ao autenticar com sucesso', async () => {
      const password = 'senha123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const userWithRealHash = { ...mockUser, password: hashedPassword };

      mockUsersService.findOneByUsername.mockResolvedValue(userWithRealHash);
      mockJwtService.sign.mockReturnValue('token_gerado');

      const result = await service.login({
        username: 'professor',
        password: password,
      });

      expect(result).toEqual({ access_token: 'token_gerado' });
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      });
    });

    it('deve lançar UnauthorizedException se a validação falhar', async () => {
      mockUsersService.findOneByUsername.mockResolvedValue(null);

      await expect(
        service.login({ username: 'errado', password: 'pwd' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve criar um novo usuário e retornar dados sem a senha', async () => {
      const dto = {
        username: 'novouser',
        password: 'password123',
        role: 'aluno',
      };
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect((result as any).password).toBeUndefined();
      expect(result.username).toBe(mockUser.username);
    });
  });
});
