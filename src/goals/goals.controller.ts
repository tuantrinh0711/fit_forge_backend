import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
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

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.goalsService.remove(id);
  }
}
