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

    const prismaParams: any = {
      where,
      orderBy: sort ? { name: sort } : undefined,
      skip: offset ?? undefined,
      take: limit ?? undefined,
    };

    const items = await this.prisma.exercise.findMany(prismaParams);

    if (tags) {
      const tagsArr = tags.split(",").map((t) => t.trim()).filter(Boolean);

      if (tagsArr.length > 0) {
        return items.filter((it) => {
          const itTags = it.tags as any;
          if (!Array.isArray(itTags)) return false;
          return tagsArr.some((tag) => itTags.includes(tag));
        });
      }
    }

    return items;
  }
}
