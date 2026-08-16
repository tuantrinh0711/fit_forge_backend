import { Controller, Get, Query } from "@nestjs/common";
import { ExerciseTemplatesService } from "./exercise-templates.service";
import { QueryExerciseTemplatesDto } from "./dto/query-exercise-templates.dto";

@Controller("exercises-templates")
export class ExerciseTemplatesController {
  constructor(private readonly svc: ExerciseTemplatesService) {}

  @Get()
  findAll(@Query() query: QueryExerciseTemplatesDto) {
    return this.svc.findAll({
      q: query.q,
      tags: query.tags,
      sort: query.sort,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
