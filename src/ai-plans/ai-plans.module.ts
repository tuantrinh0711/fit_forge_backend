import { Module } from "@nestjs/common";
import { AiPlansController } from "./ai-plans.controller";
import { AiPlansService } from "./ai-plans.service";

@Module({
  controllers: [AiPlansController],
  providers: [AiPlansService],
})
export class AiPlansModule {}
