import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Sign Up in application' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Пользователь успешно зарегистрирован',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Пользователь с таким email уже существует',
  })
  @Post('register')
  async register(
    @Body() registerDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(registerDto);
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return {
      accessToken: `Bearer: ${tokens.accessToken}`,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in into application' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Успешный вход. Возвращается access token, refresh суется в куки',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Неверный email или пароль',
  })
  async login(
    @Body() loginDto: AuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return {
      accessToken: `Bearer: ${tokens.accessToken}`,
    };
  }

  @Get('refresh')
  @ApiOperation({ summary: 'Refresh tokens' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = request.cookies['REFRESH_TOKEN'];
    const tokens = await this.authService.refresh(refreshToken);
    res.cookie('REFRESH_TOKEN', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return {
      accessToken: `Bearer: ${tokens.accessToken}`,
    };
  }
}
