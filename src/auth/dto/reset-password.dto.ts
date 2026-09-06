import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({ example: "reset-token-from-email" })
  @IsString()
  @IsNotEmpty()
  token!: string;

  @ApiProperty({ example: "correct horse battery staple" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: "correct horse battery staple" })
  @IsString()
  @MinLength(8)
  confirmPassword!: string;
}
