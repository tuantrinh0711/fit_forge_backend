-- RenameTable
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "Workout" RENAME TO "workouts";
ALTER TABLE "WorkoutExercise" RENAME TO "workout_exercises";
ALTER TABLE "WorkoutSet" RENAME TO "workout_sets";
ALTER TABLE "Meal" RENAME TO "meals";
ALTER TABLE "FoodItem" RENAME TO "food_items";
ALTER TABLE "Goal" RENAME TO "goals";
ALTER TABLE "WeightEntry" RENAME TO "weight_entries";
ALTER TABLE "TrainingPlan" RENAME TO "training_plans";

-- RenamePrimaryKey
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";
ALTER TABLE "workouts" RENAME CONSTRAINT "Workout_pkey" TO "workouts_pkey";
ALTER TABLE "workout_exercises" RENAME CONSTRAINT "WorkoutExercise_pkey" TO "workout_exercises_pkey";
ALTER TABLE "workout_sets" RENAME CONSTRAINT "WorkoutSet_pkey" TO "workout_sets_pkey";
ALTER TABLE "meals" RENAME CONSTRAINT "Meal_pkey" TO "meals_pkey";
ALTER TABLE "food_items" RENAME CONSTRAINT "FoodItem_pkey" TO "food_items_pkey";
ALTER TABLE "goals" RENAME CONSTRAINT "Goal_pkey" TO "goals_pkey";
ALTER TABLE "weight_entries" RENAME CONSTRAINT "WeightEntry_pkey" TO "weight_entries_pkey";
ALTER TABLE "training_plans" RENAME CONSTRAINT "TrainingPlan_pkey" TO "training_plans_pkey";

-- RenameUniqueIndex
ALTER INDEX "User_googleId_key" RENAME TO "users_googleId_key";
ALTER INDEX "User_email_key" RENAME TO "users_email_key";

-- RenameIndex
ALTER INDEX "Workout_userId_idx" RENAME TO "workouts_userId_idx";
ALTER INDEX "WorkoutExercise_workoutId_idx" RENAME TO "workout_exercises_workoutId_idx";
ALTER INDEX "WorkoutSet_workoutExerciseId_idx" RENAME TO "workout_sets_workoutExerciseId_idx";
ALTER INDEX "FoodItem_mealId_idx" RENAME TO "food_items_mealId_idx";

-- RenameForeignKey
ALTER TABLE "workouts" RENAME CONSTRAINT "Workout_userId_fkey" TO "workouts_userId_fkey";
ALTER TABLE "workout_exercises" RENAME CONSTRAINT "WorkoutExercise_workoutId_fkey" TO "workout_exercises_workoutId_fkey";
ALTER TABLE "workout_sets" RENAME CONSTRAINT "WorkoutSet_workoutExerciseId_fkey" TO "workout_sets_workoutExerciseId_fkey";
ALTER TABLE "food_items" RENAME CONSTRAINT "FoodItem_mealId_fkey" TO "food_items_mealId_fkey";
