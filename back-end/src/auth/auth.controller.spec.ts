import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar o access_token ao efetuar o login com sucesso', async () => {
      const loginDto = { username: 'professor', password: 'senha123' };
      const expectedResponse = { access_token: 'token_gerado' };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const createUserDto = {
        username: 'aluno1',
        password: 'senha123',
        role: 'aluno',
      };
      const expectedUser = {
        id: 2,
        username: 'aluno1',
        role: 'aluno',
      };

      mockAuthService.register.mockResolvedValue(expectedUser);

      const result = await controller.register(createUserDto);

      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedUser);
    });
  });
});
