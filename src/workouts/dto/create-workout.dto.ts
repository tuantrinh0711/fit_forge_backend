import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateWorkoutDto {
  @ApiProperty({ example: "Upper Body Strength", maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    example: "4f8c1f21-4a3e-46e7-a9f8-ff1e87710ab3",
    required: false,
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}
