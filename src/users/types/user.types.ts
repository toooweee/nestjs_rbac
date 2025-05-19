import { Prisma } from '../../../generated/prisma';

export type UserUniqueInput = Prisma.UserWhereUniqueInput;

export type ILocalUser = {
  id: number;
  email: string;
  password: string;
};
