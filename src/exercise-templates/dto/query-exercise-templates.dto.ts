import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";

export class QueryExerciseTemplatesDto {
  @ApiPropertyOptional({
    description: "Comma-separated tags to filter by (matches any)",
    example: "push,pull",
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({ description: "Search by name (case-insensitive)", example: "press" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Sort by name: 'asc' or 'desc'", example: "asc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sort?: "asc" | "desc";
}
