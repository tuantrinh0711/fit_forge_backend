import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExerciseTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: { q?: string; tags?: string; sort?: "asc" | "desc" }) {
    const { q, tags, sort } = options || {};

    const where: any = {};

    if (q) {
      where.name = { contains: q, mode: "insensitive" };
    }

    const items = await this.prisma.exerciseTemplate.findMany({
      where,
      orderBy: sort ? { name: sort } : undefined,
    });

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
