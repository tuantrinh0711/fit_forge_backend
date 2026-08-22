import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExerciseTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    q?: string;
    tags?: string;
    sort?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const { q, tags, sort, limit, offset } = options || {};

    const where: any = {};

    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    if (tags) {
      const tagsArr = tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

      if (tagsArr.length > 0) {
        where.OR = tagsArr.map((tag) => ({
          tags: { array_contains: [tag] },
        }));
      }
    }

    const prismaParams: any = {
      where,
      orderBy: sort ? { name: sort } : undefined,
      skip: offset ?? undefined,
      take: limit ?? undefined,
    };

    return this.prisma.exercise.findMany(prismaParams);
  }
}
