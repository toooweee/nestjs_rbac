import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../token/token.service';
import { JwtPayload } from '../token/types/token.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerDto: AuthDto) {
    const { email, password } = registerDto;

    try {
      await this.usersService.localFindOne({ email });
      throw new ConflictException(`User with email ${email} already exists`);
    } catch (e) {
      if (!(e instanceof NotFoundException)) {
        throw e;
      }
    }

    const hashedPassword = await argon.hash(password);

    const userRole = await this.prismaService.role.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new NotFoundException('Роль "USER" не найдена');
    }

    const user = await this.prismaService.user.create({
      data: {
        email: email,
        password: hashedPassword,
        roleId: userRole.id,
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role!.name,
    };

    const tokens = await this.tokenService.generateTokens(payload);
    await this.tokenService.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async login(loginDto: AuthDto) {
    const { email, password } = loginDto;

    let user;

    try {
      user = await this.usersService.localFindOne({ email });
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }

      console.error('Error signing in user', e);
      throw new InternalServerErrorException('Something went wrong');
    }

    if (!(await this.comparePassword(user.password, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role!,
    };

    const tokens = await this.tokenService.generateTokens(payload);
    await this.tokenService.saveRefreshToken(tokens.refreshToken, user.id);
    return tokens;
  }

  async refresh(token: string) {
    return this.tokenService.refreshTokens(token);
  }

  private async comparePassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return await argon.verify(hashedPassword, password);
  }
}
