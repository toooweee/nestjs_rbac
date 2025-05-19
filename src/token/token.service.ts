import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './types/token.types';

@Injectable()
export class TokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload) {
    const [accessTokenExpires, refreshTokenExpires] = await Promise.all([
      this.configService.get<string>('JWT_AT_EXPIRES_IN'),
      this.configService.get<string>('JWT_RT_EXPIRES_IN'),
    ]);

    const [accessTokenSecret, refreshTokenSecret] = await Promise.all([
      this.configService.get<string>('JWT_AT_SECRET'),
      this.configService.get<string>('JWT_RT_SECRET'),
    ]);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenExpires,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshTokenSecret,
      expiresIn: refreshTokenExpires,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async saveRefreshToken(refreshToken: string, userId: number) {
    return this.prismaService.token.upsert({
      where: {
        userId,
      },
      create: {
        token: refreshToken,
        userId,
      },
      update: {
        token: refreshToken,
      },
    });
  }

  async refreshTokens(refreshToken: string) {
    const tokenFromDB = await this.findRefreshToken(refreshToken);

    if (!tokenFromDB) {
      throw new UnauthorizedException();
    }

    const payload = await this.validateRefreshToken(refreshToken);

    if (!payload) {
      throw new UnauthorizedException();
    }

    const tokens = await this.generateTokens({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
    });

    await this.saveRefreshToken(tokens.refreshToken, payload.sub);

    return tokens;
  }

  private async findRefreshToken(refreshToken: string) {
    return this.prismaService.token.findUnique({
      where: {
        token: refreshToken,
      },
    });
  }

  private async validateRefreshToken(refreshToken: string) {
    return this.jwtService.verifyAsync(refreshToken);
  }
}
