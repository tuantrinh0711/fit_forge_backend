import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateMealDto {
  @ApiProperty({ example: "Breakfast", maxLength: 120 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: "2026-06-21T07:30:00.000Z",
    format: "date-time",
  })
  @IsDateString()
  @IsOptional()
  eatenAt?: string;
}
