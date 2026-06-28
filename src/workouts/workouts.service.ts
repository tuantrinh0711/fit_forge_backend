import { Injectable, NotFoundException } from "@nestjs/common";
import { Workout } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddExerciseDto } from "./dto/add-exercise.dto";
import { AddSetDto } from "./dto/add-set.dto";
import { CreateWorkoutDto } from "./dto/create-workout.dto";

const workoutInclude = {
  exercises: {
    include: {
      sets: true,
    },
  },
};

type WorkoutWithDetails = Awaited<ReturnType<WorkoutsService["findOne"]>>;

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        name: dto.name,
      },
      include: workoutInclude,
    });
  }

  findAll() {
    return this.prisma.workout.findMany({
      orderBy: { createdAt: "desc" },
      include: workoutInclude,
    });
  }

  async findOne(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: workoutInclude,
    });

    if (!workout) {
      throw new NotFoundException(`Workout ${id} was not found`);
    }

    return workout;
  }

  async addExercise(workoutId: string, dto: AddExerciseDto) {
    await this.ensureWorkoutExists(workoutId);

    return this.prisma.workoutExercise.create({
      data: {
        workoutId,
        exerciseId: dto.exerciseId,
        name: dto.name,
        notes: dto.notes,
      },
      include: { sets: true },
    });
  }

  async addSet(workoutId: string, workoutExerciseId: string, dto: AddSetDto) {
    const exercise = await this.prisma.workoutExercise.findFirst({
      where: {
        id: workoutExerciseId,
        workoutId,
      },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Exercise ${workoutExerciseId} was not found`,
      );
    }

    const set = await this.prisma.workoutSet.create({
      data: {
        workoutExerciseId,
        reps: dto.reps,
        weight: dto.weight,
      },
    });

    const workout = await this.findOne(workoutId);

    return {
      set,
      summary: this.getSummary(workout),
    };
  }

  getSummary(workout: WorkoutWithDetails | Workout) {
    if (!("exercises" in workout)) {
      return {
        exerciseCount: 0,
        setCount: 0,
        totalVolume: 0,
      };
    }

    const sets = workout.exercises.flatMap((exercise) => exercise.sets);

    return {
      exerciseCount: workout.exercises.length,
      setCount: sets.length,
      totalVolume: sets.reduce(
        (total, set) => total + set.reps * set.weight,
        0,
      ),
    };
  }

  private async ensureWorkoutExists(id: string) {
    const count = await this.prisma.workout.count({ where: { id } });
    if (count === 0) {
      throw new NotFoundException(`Workout ${id} was not found`);
    }
  }
}
