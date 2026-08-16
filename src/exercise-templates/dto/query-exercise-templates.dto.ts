import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

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

  @ApiPropertyOptional({ description: "Limit number of results", example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: "Offset for pagination", example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
