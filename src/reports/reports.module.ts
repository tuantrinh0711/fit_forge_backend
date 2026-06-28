import { Module } from "@nestjs/common";
import { GoalsModule } from "../goals/goals.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { ProgressModule } from "../progress/progress.module";
import { WorkoutsModule } from "../workouts/workouts.module";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";

@Module({
  imports: [WorkoutsModule, NutritionModule, GoalsModule, ProgressModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
