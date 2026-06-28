import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class AddExerciseDto {
  @ApiProperty({ example: "barbell-bench-press" })
  @IsString()
  @IsNotEmpty()
  exerciseId!: string;

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
