import { Body, Controller, Get, Post } from "@nestjs/common";
import { AiPlansService } from "./ai-plans.service";
import { GenerateTrainingPlanDto } from "./dto/generate-training-plan.dto";

@Controller("ai-plans")
export class AiPlansController {
  constructor(private readonly aiPlansService: AiPlansService) {}

  @Post()
  generate(@Body() dto: GenerateTrainingPlanDto) {
    return this.aiPlansService.generate(dto);
  }

  @Get()
  findAll() {
    return this.aiPlansService.findAll();
  }
}
