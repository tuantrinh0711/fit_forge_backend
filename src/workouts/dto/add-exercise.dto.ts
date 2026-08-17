import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, IsInt } from "class-validator";
import { Type } from "class-transformer";

export class AddExerciseDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  exerciseId!: number;

  @ApiProperty({ example: "Barbell Bench Press", maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "Use a controlled tempo.", maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
