import { Module } from "@nestjs/common";
import { AiPlansModule } from "./ai-plans/ai-plans.module";
import { AppController } from "./app.controller";
import { GoalsModule } from "./goals/goals.module";
import { NutritionModule } from "./nutrition/nutrition.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProgressModule } from "./progress/progress.module";
import { ReportsModule } from "./reports/reports.module";
import { SearchModule } from "./search/search.module";
import { WorkoutsModule } from "./workouts/workouts.module";

@Module({
  imports: [
    PrismaModule,
    WorkoutsModule,
    NutritionModule,
    GoalsModule,
    ProgressModule,
    ReportsModule,
    AiPlansModule,
    SearchModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
