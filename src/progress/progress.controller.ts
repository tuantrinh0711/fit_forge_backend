import { Body, Controller, Get, Post } from "@nestjs/common";
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
}
