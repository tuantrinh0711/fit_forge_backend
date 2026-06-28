import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LogWeightDto } from "./dto/log-weight.dto";

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  logWeight(dto: LogWeightDto) {
    return this.prisma.weightEntry.create({
      data: {
        weight: dto.weight,
        loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : undefined,
      },
    });
  }

  findWeights() {
    return this.prisma.weightEntry.findMany({
      orderBy: { loggedAt: "asc" },
    });
  }

  latestWeight() {
    return this.prisma.weightEntry.findFirst({
      orderBy: { loggedAt: "desc" },
    });
  }

  async getWeightChange(fromDate: Date): Promise<number> {
    const entries = await this.prisma.weightEntry.findMany({
      where: { loggedAt: { gte: fromDate } },
      orderBy: { loggedAt: "asc" },
    });

    if (entries.length < 2) {
      return 0;
    }

    return entries.at(-1)!.weight - entries[0].weight;
  }
}
