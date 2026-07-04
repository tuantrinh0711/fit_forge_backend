import { ApiProperty } from "@nestjs/swagger";
import { SearchResultType, searchResultTypes } from "./search-query.dto";

export class SearchResultDto {
  @ApiProperty({ example: "uuid" })
  id!: string;

  @ApiProperty({ enum: searchResultTypes, example: "exercise" })
  type!: SearchResultType;

  @ApiProperty({ example: "Bench Press" })
  title!: string;

  @ApiProperty({ example: "Exercise in Push Day" })
  summary!: string;

  @ApiProperty({ example: "2026-07-04T07:00:00.000Z" })
  date!: Date;

  @ApiProperty({
    type: "object",
    additionalProperties: true,
    example: { workoutId: "uuid" },
  })
  metadata!: Record<string, unknown>;
}

export class SearchResponseDto {
  @ApiProperty({ example: "bench" })
  query!: string;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  offset!: number;

  @ApiProperty({ example: 1 })
  total!: number;

  @ApiProperty({ type: [SearchResultDto] })
  results!: SearchResultDto[];
}
