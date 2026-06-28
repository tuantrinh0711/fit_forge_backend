import { Injectable, NotFoundException } from "@nestjs/common";
import { FoodItem } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddFoodDto } from "./dto/add-food.dto";
import { CreateMealDto } from "./dto/create-meal.dto";

type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

@Injectable()
export class NutritionService {
  constructor(private readonly prisma: PrismaService) {}

  createMeal(dto: CreateMealDto) {
    return this.prisma.meal.create({
      data: {
        name: dto.name,
        eatenAt: dto.eatenAt ? new Date(dto.eatenAt) : undefined,
      },
      include: { foods: true },
    });
  }

  findMeals() {
    return this.prisma.meal.findMany({
      orderBy: { eatenAt: "desc" },
      include: { foods: true },
    });
  }

  async addFood(mealId: string, dto: AddFoodDto) {
    await this.ensureMealExists(mealId);

    await this.prisma.foodItem.create({
      data: {
        mealId,
        ...dto,
      },
    });

    return this.findMealWithTotals(mealId);
  }

  async getDailyTotals(
    date = new Date().toISOString().slice(0, 10),
  ): Promise<NutritionTotals> {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const foods = await this.prisma.foodItem.findMany({
      where: {
        meal: {
          eatenAt: {
            gte: start,
            lt: end,
          },
        },
      },
    });

    return this.calculateTotals(foods);
  }

  private async findMealWithTotals(id: string) {
    const meal = await this.prisma.meal.findUnique({
      where: { id },
      include: { foods: true },
    });

    if (!meal) {
      throw new NotFoundException(`Meal ${id} was not found`);
    }

    return {
      ...meal,
      totals: this.calculateTotals(meal.foods),
    };
  }

  private async ensureMealExists(id: string) {
    const count = await this.prisma.meal.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Meal ${id} was not found`);
    }
  }

  private calculateTotals(items: FoodItem[]): NutritionTotals {
    return items.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fat: totals.fat + item.fat,
      }),
      this.emptyTotals(),
    );
  }

  private emptyTotals(): NutritionTotals {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  }
}
