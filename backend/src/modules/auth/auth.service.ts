import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password_hash'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userService.create({
      username: dto.username,
      email: dto.email,
      passwordHash,
      avatar: dto.avatar ?? null,
      bio: dto.bio ?? null,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findByAccountForAuth(dto.account);
    if (!user) {
      throw new UnauthorizedException('账号或密码错误');
    }
    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('账号或密码错误');
    }
    return this.buildAuthResponse(user);
  }

  async profile(userId: number): Promise<User> {
    return this.userService.findById(userId);
  }

  private buildAuthResponse(user: User): AuthResponse {
    const payload: JwtUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const { password_hash: _passwordHash, ...publicUser } = user;
    return {
      token: this.jwtService.sign(payload),
      user: publicUser,
    };
  }
}
