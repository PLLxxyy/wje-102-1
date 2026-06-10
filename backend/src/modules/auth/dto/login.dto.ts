import { IsString, Length } from 'class-validator';

export class LoginDto {
  @IsString()
  @Length(3, 100)
  account!: string;

  @IsString()
  @Length(6, 72)
  password!: string;
}
