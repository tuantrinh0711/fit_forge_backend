import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignUpDto {
  @ApiProperty({ example: "alex@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "correct horse battery staple" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: "correct horse battery staple" })
  @IsString()
  @IsNotEmpty()
  confirmPassword!: string;

  @ApiProperty({ example: "Alex Morgan" })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
