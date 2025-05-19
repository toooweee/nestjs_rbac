import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @IsEmail({}, { message: 'Пожалуйста, введите корректный email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'user@example.com',
    nullable: false,
  })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @ApiProperty({
    description:
      'Пароль пользователя (мин. 6 символов, рекомендуется сложность)',
    example: 'P@$$wOrd123',
    nullable: false,
    minLength: 6,
  })
  password: string;
}
