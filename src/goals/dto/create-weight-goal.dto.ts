import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class CreateWeightGoalDto {
  @ApiProperty({ example: 70, minimum: 1, description: "Target body weight." })
  @IsNumber()
  @Min(1)
  targetWeight!: number;

  @ApiProperty({ example: "2026-12-31", format: "date" })
  @IsDateString()
  targetDate!: string;

  @ApiPropertyOptional({
    example: 78,
    minimum: 1,
    description: "Starting body weight.",
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  startingWeight?: number;
}
