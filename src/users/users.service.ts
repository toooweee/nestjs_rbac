import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserUniqueInput } from './types';
import { Prisma } from 'generated/prisma';
import { PrismaErrorCodes } from '../prisma/prismaErrorCodes.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async localFindOne(where: UserUniqueInput) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where,
        select: {
          id: true,
          email: true,
          password: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      });

      return {
        ...user,
        role: user.role?.name,
      };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === PrismaErrorCodes.NotFound
      ) {
        throw new NotFoundException('User not found');
      }

      console.error('Error finding user', e);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
