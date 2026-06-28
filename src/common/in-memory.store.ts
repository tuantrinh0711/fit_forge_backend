import { Injectable } from "@nestjs/common";

export type WorkoutSet = {
  id: string;
  reps: number;
  weight: number;
  createdAt: string;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  notes?: string;
  sets: WorkoutSet[];
  createdAt: string;
};

export type Workout = {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
};

export type FoodItem = {
  id: string;
  name: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = {
  id: string;
  name: string;
  eatenAt: string;
  foods: FoodItem[];
  totals: NutritionTotals;
  createdAt: string;
  updatedAt: string;
};

export type NutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Goal = {
  id: string;
  type: "weight";
  targetWeight: number;
  targetDate: string;
  startingWeight?: number;
  createdAt: string;
};

export type WeightEntry = {
  id: string;
  weight: number;
  loggedAt: string;
  createdAt: string;
};

export type TrainingPlan = {
  id: string;
  goal: string;
  experienceLevel: string;
  daysPerWeek: number;
  plan: string[];
  createdAt: string;
};

@Injectable()
export class InMemoryStore {
  readonly workouts: Workout[] = [];
  readonly meals: Meal[] = [];
  readonly goals: Goal[] = [];
  readonly weights: WeightEntry[] = [];
  readonly trainingPlans: TrainingPlan[] = [];
}
