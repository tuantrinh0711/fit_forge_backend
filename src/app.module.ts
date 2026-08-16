import { Module } from "@nestjs/common";
import { AiPlansModule } from "./ai-plans/ai-plans.module";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { GoalsModule } from "./goals/goals.module";
import { NutritionModule } from "./nutrition/nutrition.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProgressModule } from "./progress/progress.module";
import { ReportsModule } from "./reports/reports.module";
import { SearchModule } from "./search/search.module";
import { WorkoutsModule } from "./workouts/workouts.module";
import { ExerciseTemplatesModule } from "./exercise-templates/exercise-templates.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkoutsModule,
    NutritionModule,
    GoalsModule,
    ProgressModule,
    ReportsModule,
    AiPlansModule,
    SearchModule,
    ExerciseTemplatesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
