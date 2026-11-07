import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Workout } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AddExerciseDto } from "./dto/add-exercise.dto";
import { AddSetDto } from "./dto/add-set.dto";
import { CreateWorkoutDto } from "./dto/create-workout.dto";
import { UpdateSetDto } from "./dto/update-set.dto";
import {
  meetsProgressionTarget,
  recommendNextSets,
} from "./progressive-overload";

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
        userId: dto.userId,
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

  async getWeeklyProgression(userId: string, weekStart: Date) {
    const currentWeekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const previousWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [previousSessions, currentSessions] = await Promise.all([
      this.findExerciseSessions(userId, previousWeekStart, weekStart),
      this.findExerciseSessions(userId, weekStart, currentWeekEnd),
    ]);

    const previousByExercise = this.latestSessionsByExercise(previousSessions);
    const currentByExercise = this.latestSessionsByExercise(currentSessions);
    const recommendations = [...previousByExercise.entries()].map(
      ([exerciseId, session]) => ({
        exerciseId: String(exerciseId),
        exerciseName: session.name,
        weekStart: weekStart.toISOString(),
        previousSessionAt: session.sets.at(-1)?.createdAt.toISOString(),
        sets: recommendNextSets(session.sets),
      }),
    );

    let eligibleExerciseCount = 0;
    let achievedExerciseCount = 0;
    for (const [exerciseId, baseline] of previousByExercise) {
      const current = currentByExercise.get(exerciseId);
      if (!current || current.sets.length < baseline.sets.length) continue;

      eligibleExerciseCount += 1;
      if (
        meetsProgressionTarget(
          current.sets,
          recommendNextSets(baseline.sets),
        )
      ) {
        achievedExerciseCount += 1;
      }
    }

    return {
      weekStart: weekStart.toISOString(),
      recommendations,
      weeklySummary: {
        achievedExerciseCount,
        eligibleExerciseCount,
        ratePercent:
          eligibleExerciseCount === 0
            ? null
            : Math.round((achievedExerciseCount / eligibleExerciseCount) * 100),
      },
    };
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

  async remove(id: string): Promise<void> {
    const result = await this.prisma.workout.deleteMany({ where: { id } });
    if (result.count === 0)
      throw new NotFoundException("Workout " + id + " was not found");
  }

  async removeExercise(workoutId: string, exerciseId: string): Promise<void> {
    const result = await this.prisma.workoutExercise.deleteMany({
      where: { id: exerciseId, workoutId },
    });
    if (result.count === 0)
      throw new NotFoundException("Exercise " + exerciseId + " was not found");
  }

  async removeSet(
    workoutId: string,
    exerciseId: string,
    setId: string,
  ): Promise<void> {
    const result = await this.prisma.workoutSet.deleteMany({
      where: { id: setId, workoutExercise: { id: exerciseId, workoutId } },
    });
    if (result.count === 0)
      throw new NotFoundException("Set " + setId + " was not found");
  }

  async updateSet(
    userId: string | undefined,
    workoutId: string,
    exerciseId: string,
    setId: string,
    dto: UpdateSetDto,
  ) {
    if (!userId)
      throw new UnauthorizedException("An authenticated user is required");
    const workout = await this.prisma.workout.findUnique({
      where: { id: workoutId },
      select: { userId: true },
    });
    if (!workout)
      throw new NotFoundException(`Workout ${workoutId} was not found`);
    if (workout.userId !== userId)
      throw new ForbiddenException("You do not own this workout");
    const exercise = await this.prisma.workoutExercise.findFirst({
      where: { id: exerciseId, workoutId },
      select: { id: true },
    });
    if (!exercise)
      throw new NotFoundException(`Exercise ${exerciseId} was not found`);
    const set = await this.prisma.workoutSet.findFirst({
      where: { id: setId, workoutExerciseId: exerciseId },
      select: { id: true },
    });
    if (!set) throw new NotFoundException(`Set ${setId} was not found`);
    await this.prisma.workoutSet.update({
      where: { id: setId },
      data: { reps: dto.reps, weight: dto.weight },
    });
    return this.findOne(workoutId);
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

  private findExerciseSessions(userId: string, start: Date, end: Date) {
    return this.prisma.workoutExercise.findMany({
      where: {
        workout: { is: { userId } },
        sets: { some: { createdAt: { gte: start, lt: end } } },
      },
      include: {
        sets: {
          where: { createdAt: { gte: start, lt: end } },
          orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        },
      },
    });
  }

  private latestSessionsByExercise<T extends {
    exerciseId: number;
    sets: { createdAt: Date }[];
  }>(sessions: T[]) {
    const latest = new Map<number, T>();
    for (const session of sessions) {
      if (session.sets.length === 0) continue;
      const current = latest.get(session.exerciseId);
      const lastSetAt = session.sets.at(-1)!.createdAt;
      const currentLastSetAt = current?.sets.at(-1)?.createdAt;
      if (!currentLastSetAt || lastSetAt > currentLastSetAt) {
        latest.set(session.exerciseId, session);
      }
    }
    return latest;
  }
}
