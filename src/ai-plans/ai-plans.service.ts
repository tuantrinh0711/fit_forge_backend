import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GenerateTrainingPlanDto } from "./dto/generate-training-plan.dto";

@Injectable()
export class AiPlansService {
  constructor(private readonly prisma: PrismaService) {}

  generate(dto: GenerateTrainingPlanDto) {
    const templates = [
      "Full-body strength: squat pattern, push, pull, hinge, core",
      "Conditioning: intervals, steady cardio, mobility",
      "Upper body: horizontal push, vertical pull, arms, core",
      "Lower body: squat, hinge, unilateral legs, calves",
      "Recovery: zone 2 cardio, stretching, light core",
      "Hypertrophy: compound lift, accessories, loaded carries",
      "Skill and mobility: technique practice, balance, tissue work",
    ];

    return this.prisma.trainingPlan.create({
      data: {
        goal: dto.goal,
        experienceLevel: dto.experienceLevel,
        daysPerWeek: dto.daysPerWeek,
        plan: templates.slice(0, dto.daysPerWeek),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.prisma.trainingPlan.deleteMany({ where: { id } });
    if (result.count === 0)
      throw new NotFoundException("Training plan " + id + " was not found");
  }

  findAll() {
    return this.prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
