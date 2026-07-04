import { Controller, Get, Query } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { SearchQueryDto, searchResultTypes } from "./dto/search-query.dto";
import { SearchResponseDto } from "./dto/search-response.dto";
import { SearchService } from "./search.service";

@ApiTags("search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: "Search fitness records",
    description:
      "Search workouts, exercises, meals, foods, goals, weight entries, and training plans.",
  })
  @ApiQuery({ name: "q", required: true, example: "bench" })
  @ApiQuery({ name: "type", required: false, enum: searchResultTypes })
  @ApiQuery({ name: "limit", required: false, example: 20, type: Number })
  @ApiQuery({ name: "offset", required: false, example: 0, type: Number })
  @ApiOkResponse({
    description: "Search results grouped into a normalized response shape.",
    type: SearchResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      "Invalid search query, unsupported type, or pagination value outside the allowed range.",
  })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }
}
