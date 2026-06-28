import { Injectable } from "@nestjs/common";
import { Goal } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateWeightGoalDto } from "./dto/create-weight-goal.dto";

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  createWeightGoal(dto: CreateWeightGoalDto) {
    return this.prisma.goal.create({
      data: {
        type: "weight",
        targetWeight: dto.targetWeight,
        targetDate: new Date(dto.targetDate),
        startingWeight: dto.startingWeight,
      },
    });
  }

  findAll() {
    return this.prisma.goal.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  getCompletionPercentage(goal: Goal, currentWeight?: number): number {
    if (!goal.startingWeight || currentWeight === undefined) {
      return 0;
    }

    const totalDelta = goal.targetWeight - goal.startingWeight;
    const currentDelta = currentWeight - goal.startingWeight;
    if (totalDelta === 0) {
      return 100;
    }

    const completion = (currentDelta / totalDelta) * 100;
    return Math.max(0, Math.min(100, Math.round(completion)));
  }
}
