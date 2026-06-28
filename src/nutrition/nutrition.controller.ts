import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AddFoodDto } from "./dto/add-food.dto";
import { CreateMealDto } from "./dto/create-meal.dto";
import { NutritionService } from "./nutrition.service";

@Controller("nutrition")
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post("meals")
  createMeal(@Body() dto: CreateMealDto) {
    return this.nutritionService.createMeal(dto);
  }

  @Get("meals")
  findMeals() {
    return this.nutritionService.findMeals();
  }

  @Post("meals/:id/foods")
  addFood(@Param("id") id: string, @Body() dto: AddFoodDto) {
    return this.nutritionService.addFood(id, dto);
  }

  @Get("daily-totals")
  dailyTotals(@Query("date") date?: string) {
    return this.nutritionService.getDailyTotals(date);
  }
}
