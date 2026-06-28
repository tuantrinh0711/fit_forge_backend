import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateWeightGoalDto } from "./dto/create-weight-goal.dto";
import { GoalsService } from "./goals.service";

@Controller("goals")
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() dto: CreateWeightGoalDto) {
    return this.goalsService.createWeightGoal(dto);
  }

  @Get()
  findAll() {
    return this.goalsService.findAll();
  }
}
