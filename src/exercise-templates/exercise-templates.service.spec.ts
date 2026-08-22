import { ExerciseTemplatesService } from "./exercise-templates.service";

describe("ExerciseTemplatesService", () => {
  it("applies name and tag filters in the Prisma query", async () => {
    const prisma = {
      exercise: {
        findMany: jest.fn().mockResolvedValue([
          { id: 1, name: "Close-Grip Bench Press", tags: ["push", "arms"] },
        ]),
      },
    };

    const service = new ExerciseTemplatesService(prisma as never);

    await service.findAll({
      q: "press",
      tags: "arms, chest",
      sort: "asc",
      limit: 20,
      offset: 0,
    });

    expect(prisma.exercise.findMany).toHaveBeenCalledWith({
      where: {
        name: { contains: "press", mode: "insensitive" },
        OR: [{ tags: { array_contains: ["arms"] } }, { tags: { array_contains: ["chest"] } }],
      },
      orderBy: { name: "asc" },
      skip: 0,
      take: 20,
    });
  });
});
