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

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.aiPlansService.remove(id);
  }
}
