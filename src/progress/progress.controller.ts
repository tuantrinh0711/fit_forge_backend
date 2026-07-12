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
import { LogWeightDto } from "./dto/log-weight.dto";
import { ProgressService } from "./progress.service";

@Controller("progress")
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post("weights")
  logWeight(@Body() dto: LogWeightDto) {
    return this.progressService.logWeight(dto);
  }

  @Get("weights")
  findWeights() {
    return this.progressService.findWeights();
  }

  @Delete("weights/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeWeight(@Param("id") id: string) {
    return this.progressService.removeWeight(id);
  }
}
