import { Injectable } from "@nestjs/common";
import { GoalsService } from "../goals/goals.service";
import { NutritionService } from "../nutrition/nutrition.service";
import { ProgressService } from "../progress/progress.service";
import { WorkoutsService } from "../workouts/workouts.service";

@Injectable()
export class ReportsService {
  constructor(
    private readonly workoutsService: WorkoutsService,
    private readonly nutritionService: NutritionService,
    private readonly goalsService: GoalsService,
    private readonly progressService: ProgressService,
  ) {}

  async weeklyReport() {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [workouts, nutritionTotals, weightChange, latestWeight, goals] =
      await Promise.all([
        this.workoutsService.findAll(),
        this.nutritionService.getDailyTotals(),
        this.progressService.getWeightChange(weekStart),
        this.progressService.latestWeight(),
        this.goalsService.findAll(),
      ]);

    const weeklyWorkouts = workouts.filter(
      (workout) => workout.createdAt >= weekStart,
    );

    return {
      periodStart: weekStart.toISOString(),
      periodEnd: new Date().toISOString(),
      workoutFrequency: weeklyWorkouts.length,
      caloriesConsumedToday: nutritionTotals.calories,
      weightChange,
      goals: goals.map((goal) => ({
        id: goal.id,
        type: goal.type,
        targetWeight: goal.targetWeight,
        targetDate: goal.targetDate,
        completionPercentage: this.goalsService.getCompletionPercentage(
          goal,
          latestWeight?.weight,
        ),
      })),
    };
  }
}
