import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, Min } from "class-validator";

export class LogWeightDto {
  @ApiProperty({ example: 76.5, minimum: 1 })
  @IsNumber()
  @Min(1)
  weight!: number;

  @ApiPropertyOptional({
    example: "2026-06-21T07:30:00.000Z",
    format: "date-time",
  })
  @IsDateString()
  @IsOptional()
  loggedAt?: string;
}
