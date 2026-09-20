import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AddExerciseDto } from "./dto/add-exercise.dto";
import { Request } from "express";
import { AddSetDto } from "./dto/add-set.dto";
import { CreateWorkoutDto } from "./dto/create-workout.dto";
import { UpdateSetDto } from "./dto/update-set.dto";
import { WorkoutsService } from "./workouts.service";
import { AuthGuard } from "../auth/auth.guard";

@Controller("workouts")
export class WorkoutsController {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Post()
  create(@Body() dto: CreateWorkoutDto) {
    return this.workoutsService.create(dto);
  }

  @Get()
  findAll() {
    return this.workoutsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const workout = await this.workoutsService.findOne(id);

    return {
      ...workout,
      summary: this.workoutsService.getSummary(workout),
    };
  }

  @Post(":id/exercises")
  addExercise(@Param("id") id: string, @Body() dto: AddExerciseDto) {
    return this.workoutsService.addExercise(id, dto);
  }

  @Post(":id/exercises/:exerciseId/sets")
  addSet(
    @Param("id") id: string,
    @Param("exerciseId") exerciseId: string,
    @Body() dto: AddSetDto,
  ) {
    return this.workoutsService.addSet(id, exerciseId, dto);
  }

  @Patch(":id/exercises/:exerciseId/sets/:setId")
  @UseGuards(AuthGuard)
  updateSet(
    @Param("id") workoutId: string,
    @Param("exerciseId") exerciseId: string,
    @Param("setId") setId: string,
    @Body() dto: UpdateSetDto,
    @Req() request: Request & { user?: { id?: string; userId?: string } },
  ) {
    const userId = request.user?.id ?? request.user?.userId;
    return this.workoutsService.updateSet(
      userId,
      workoutId,
      exerciseId,
      setId,
      dto,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.workoutsService.remove(id);
  }

  @Delete(":id/exercises/:exerciseId")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeExercise(
    @Param("id") id: string,
    @Param("exerciseId") exerciseId: string,
  ) {
    return this.workoutsService.removeExercise(id, exerciseId);
  }

  @Delete(":id/exercises/:exerciseId/sets/:setId")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSet(
    @Param("id") id: string,
    @Param("exerciseId") exerciseId: string,
    @Param("setId") setId: string,
  ) {
    return this.workoutsService.removeSet(id, exerciseId, setId);
  }
}
