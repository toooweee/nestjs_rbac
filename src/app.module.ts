import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        FRONTEND_URL: Joi.string().required(),
        JWT_AT_SECRET: Joi.string().required(),
        JWT_RT_SECRET: Joi.string().required(),
        JWT_AT_EXPIRES_IN: Joi.string().required(),
        JWT_RT_EXPIRES_IN: Joi.string().required(),
      }),
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    TokenModule,
  ],
})
export class AppModule {}
