import {
  Injectable,
  OnModuleInit,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type PublicUser = Omit<User, 'password'>;

export interface PaginatedUsersResponse {
  data: PublicUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Seed default users if table is empty
    const count = await this.usersRepository.count();
    if (count === 0) {
      console.log('Populando banco com usuários padrão...');

      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash('senha123', salt);

      const professor = this.usersRepository.create({
        username: 'professor',
        password: hashedPassword,
        role: 'professor',
      });

      const aluno = this.usersRepository.create({
        username: 'aluno',
        password: hashedPassword,
        role: 'aluno',
      });

      await this.usersRepository.save([professor, aluno]);
      console.log(
        'Usuários padrão criados: professor/senha123 e aluno/senha123',
      );
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findOneByUsername(createUserDto.username);
    if (existingUser) {
      throw new ConflictException('Nome de usuário já está em uso');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      role: createUserDto.role ?? 'aluno',
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAllPaginated(
    role?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedUsersResponse> {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
    const where = role ? { role } : {};

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data: users.map((u) => this.toPublicUser(u)),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  }

  async findOneById(id: number): Promise<PublicUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    return this.toPublicUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== user.username
    ) {
      const existing = await this.findOneByUsername(updateUserDto.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('Nome de usuário já está em uso');
      }
      user.username = updateUserDto.username;
    }

    if (updateUserDto.role) {
      user.role = updateUserDto.role;
    }

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const saved = await this.usersRepository.save(user);
    return this.toPublicUser(saved);
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado`);
    }
    await this.usersRepository.remove(user);
  }

  public toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
