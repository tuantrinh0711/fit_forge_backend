import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { SearchQueryDto, SearchResultType } from "./dto/search-query.dto";

type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  summary: string;
  date: Date;
  metadata: Record<string, unknown>;
};

type SearchResponse = {
  query: string;
  limit: number;
  offset: number;
  total: number;
  results: SearchResult[];
};

const textFilter = (query: string): Prisma.StringFilter => ({
  contains: query,
  mode: "insensitive",
});

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchQueryDto): Promise<SearchResponse> {
    const query = dto.q.trim();
    const limit = dto.limit ?? 20;
    const offset = dto.offset ?? 0;
    const results = await this.collectResults(query, dto.type);
    const ranked = results.sort((left, right) => {
      const rankDiff = this.rank(left, query) - this.rank(right, query);
      if (rankDiff !== 0) {
        return rankDiff;
      }

      return right.date.getTime() - left.date.getTime();
    });

    return {
      query,
      limit,
      offset,
      total: ranked.length,
      results: ranked.slice(offset, offset + limit),
    };
  }

  private async collectResults(
    query: string,
    type?: SearchResultType,
  ): Promise<SearchResult[]> {
    const searches: Array<Promise<SearchResult[]>> = [];

    if (!type || type === "workout") {
      searches.push(this.searchWorkouts(query));
    }
    if (!type || type === "exercise") {
      searches.push(this.searchExercises(query));
    }
    if (!type || type === "meal") {
      searches.push(this.searchMeals(query));
    }
    if (!type || type === "food") {
      searches.push(this.searchFoods(query));
    }
    if (!type || type === "goal") {
      searches.push(this.searchGoals(query));
    }
    if (!type || type === "weight") {
      searches.push(this.searchWeights(query));
    }
    if (!type || type === "training_plan") {
      searches.push(this.searchTrainingPlans(query));
    }

    return (await Promise.all(searches)).flat();
  }

  private async searchWorkouts(query: string): Promise<SearchResult[]> {
    const workouts = await this.prisma.workout.findMany({
      where: { name: textFilter(query) },
      orderBy: { createdAt: "desc" },
    });

    return workouts.map((workout) => ({
      id: workout.id,
      type: "workout",
      title: workout.name,
      summary: "Workout session",
      date: workout.createdAt,
      metadata: { updatedAt: workout.updatedAt },
    }));
  }

  private async searchExercises(query: string): Promise<SearchResult[]> {
    const exercises = await this.prisma.workoutExercise.findMany({
      where: {
        OR: [
          { name: textFilter(query) },
          { exerciseId: textFilter(query) },
          { notes: textFilter(query) },
        ],
      },
      include: { workout: true },
      orderBy: { createdAt: "desc" },
    });

    return exercises.map((exercise) => ({
      id: exercise.id,
      type: "exercise",
      title: exercise.name,
      summary: exercise.notes ?? `Exercise in ${exercise.workout.name}`,
      date: exercise.createdAt,
      metadata: {
        exerciseId: exercise.exerciseId,
        workoutId: exercise.workoutId,
        workoutName: exercise.workout.name,
      },
    }));
  }

  private async searchMeals(query: string): Promise<SearchResult[]> {
    const meals = await this.prisma.meal.findMany({
      where: { name: textFilter(query) },
      orderBy: { eatenAt: "desc" },
    });

    return meals.map((meal) => ({
      id: meal.id,
      type: "meal",
      title: meal.name,
      summary: "Meal log",
      date: meal.eatenAt,
      metadata: { createdAt: meal.createdAt, updatedAt: meal.updatedAt },
    }));
  }

  private async searchFoods(query: string): Promise<SearchResult[]> {
    const foods = await this.prisma.foodItem.findMany({
      where: { name: textFilter(query) },
      include: { meal: true },
      orderBy: { meal: { eatenAt: "desc" } },
    });

    return foods.map((food) => ({
      id: food.id,
      type: "food",
      title: food.name,
      summary: `Food in ${food.meal.name}`,
      date: food.meal.eatenAt,
      metadata: {
        mealId: food.mealId,
        mealName: food.meal.name,
        servingSize: food.servingSize,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      },
    }));
  }

  private async searchGoals(query: string): Promise<SearchResult[]> {
    const goals = await this.prisma.goal.findMany({
      where: { type: textFilter(query) },
      orderBy: { createdAt: "desc" },
    });

    return goals.map((goal) => ({
      id: goal.id,
      type: "goal",
      title: `${goal.type} goal`,
      summary: `Target weight ${goal.targetWeight} by ${goal.targetDate.toISOString().slice(0, 10)}`,
      date: goal.createdAt,
      metadata: {
        type: goal.type,
        targetWeight: goal.targetWeight,
        targetDate: goal.targetDate,
        startingWeight: goal.startingWeight,
      },
    }));
  }

  private async searchWeights(query: string): Promise<SearchResult[]> {
    const parsedWeight = Number(query);
    if (!Number.isFinite(parsedWeight)) {
      return [];
    }

    const weights = await this.prisma.weightEntry.findMany({
      where: { weight: parsedWeight },
      orderBy: { loggedAt: "desc" },
    });

    return weights.map((entry) => ({
      id: entry.id,
      type: "weight",
      title: `${entry.weight} weight entry`,
      summary: `Logged on ${entry.loggedAt.toISOString().slice(0, 10)}`,
      date: entry.loggedAt,
      metadata: { weight: entry.weight, createdAt: entry.createdAt },
    }));
  }

  private async searchTrainingPlans(query: string): Promise<SearchResult[]> {
    const normalizedQuery = query.toLowerCase();
    const plans = await this.prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
    });

    return plans
      .filter(
        (plan) =>
          plan.goal.toLowerCase().includes(normalizedQuery) ||
          plan.experienceLevel.toLowerCase().includes(normalizedQuery) ||
          plan.plan.some((item) =>
            item.toLowerCase().includes(normalizedQuery),
          ),
      )
      .map((plan) => ({
        id: plan.id,
        type: "training_plan",
        title: `${plan.goal} training plan`,
        summary: `${plan.experienceLevel}, ${plan.daysPerWeek} days per week`,
        date: plan.createdAt,
        metadata: {
          goal: plan.goal,
          experienceLevel: plan.experienceLevel,
          daysPerWeek: plan.daysPerWeek,
          plan: plan.plan,
        },
      }));
  }

  private rank(result: SearchResult, query: string) {
    const normalizedQuery = query.toLowerCase();
    const title = result.title.toLowerCase();
    const summary = result.summary.toLowerCase();

    if (title === normalizedQuery) {
      return 0;
    }
    if (title.startsWith(normalizedQuery)) {
      return 1;
    }
    if (title.includes(normalizedQuery)) {
      return 2;
    }
    if (summary.includes(normalizedQuery)) {
      return 3;
    }

    return 4;
  }
}
