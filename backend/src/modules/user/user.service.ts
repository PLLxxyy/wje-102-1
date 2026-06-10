import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { UserRole } from '../../types/enums';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

interface CreateUserInput {
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string | null;
  bio?: string | null;
  role?: UserRole;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const exists = await this.userRepository.exists({
      where: [{ username: input.username }, { email: input.email }],
    });
    if (exists) {
      throw new ConflictException('用户名或邮箱已存在');
    }
    const user = this.userRepository.create({
      username: input.username,
      email: input.email,
      password_hash: input.passwordHash,
      avatar: input.avatar ?? null,
      bio: input.bio ?? null,
      role: input.role ?? UserRole.User,
    });
    return this.userRepository.save(user);
  }

  async findAll(search?: string): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user').orderBy('user.created_at', 'DESC');
    if (search && search.trim().length > 0) {
      const keyword = `%${search.trim()}%`;
      query.andWhere(
        new Brackets((builder) => {
          builder
            .where('user.username LIKE :keyword', { keyword })
            .orWhere('user.email LIKE :keyword', { keyword });
        }),
      );
    }
    return query.getMany();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }

  async findByAccountForAuth(account: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.username = :account', { account })
      .orWhere('user.email = :account', { account })
      .getOne();
  }

  async updateProfile(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (dto.avatar !== undefined) {
      user.avatar = dto.avatar ?? null;
    }
    if (dto.bio !== undefined) {
      user.bio = dto.bio ?? null;
    }
    return this.userRepository.save(user);
  }
}
