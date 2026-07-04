import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export const searchResultTypes = [
  "workout",
  "exercise",
  "meal",
  "food",
  "goal",
  "weight",
  "training_plan",
] as const;

export type SearchResultType = (typeof searchResultTypes)[number];

export class SearchQueryDto {
  @ApiPropertyOptional({
    description:
      "Search text. Whitespace is trimmed and at least 2 characters are required.",
    example: "bench",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : "",
  )
  @IsString()
  @MinLength(2)
  q!: string;

  @ApiPropertyOptional({
    enum: searchResultTypes,
    description: "Optional result type filter.",
    example: "exercise",
  })
  @IsOptional()
  @IsIn(searchResultTypes)
  type?: SearchResultType;

  @ApiPropertyOptional({
    description: "Maximum number of results to return.",
    default: 20,
    minimum: 1,
    maximum: 50,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @ApiPropertyOptional({
    description: "Number of matching results to skip.",
    default: 0,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset = 0;
}
