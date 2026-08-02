import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
  @ApiProperty({ example: "alex@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "correct horse battery staple" })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
