import { SearchService } from "./search.service";

describe("SearchService", () => {
  const now = new Date("2026-07-04T07:00:00.000Z");

  const createPrismaMock = () => ({
    workout: { findMany: jest.fn().mockResolvedValue([]) },
    workoutExercise: { findMany: jest.fn().mockResolvedValue([]) },
    meal: { findMany: jest.fn().mockResolvedValue([]) },
    foodItem: { findMany: jest.fn().mockResolvedValue([]) },
    goal: { findMany: jest.fn().mockResolvedValue([]) },
    weightEntry: { findMany: jest.fn().mockResolvedValue([]) },
    trainingPlan: { findMany: jest.fn().mockResolvedValue([]) },
  });

  it("searches workouts by partial name", async () => {
    const prisma = createPrismaMock();
    prisma.workout.findMany.mockResolvedValue([
      { id: "workout-1", name: "Push Day", createdAt: now, updatedAt: now },
    ]);
    const service = new SearchService(prisma as never);

    const result = await service.search({ q: "push", limit: 20, offset: 0 });

    expect(prisma.workout.findMany).toHaveBeenCalledWith({
      where: { name: { contains: "push", mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
    });
    expect(result.total).toBe(1);
    expect(result.results[0]).toMatchObject({
      id: "workout-1",
      type: "workout",
      title: "Push Day",
    });
  });

  it("searches exercises by name, exercise id, and notes", async () => {
    const prisma = createPrismaMock();
    prisma.workoutExercise.findMany.mockResolvedValue([
      {
        id: "exercise-1",
        exerciseId: "bench-press",
        name: "Bench Press",
        notes: "Heavy top set",
        workoutId: "workout-1",
        workout: { id: "workout-1", name: "Push Day" },
        createdAt: now,
      },
    ]);
    const service = new SearchService(prisma as never);

    const result = await service.search({
      q: "bench",
      type: "exercise",
      limit: 20,
      offset: 0,
    });

    expect(prisma.workoutExercise.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: "bench", mode: "insensitive" } },
          { exerciseId: { contains: "bench", mode: "insensitive" } },
          { notes: { contains: "bench", mode: "insensitive" } },
        ],
      },
      include: { workout: true },
      orderBy: { createdAt: "desc" },
    });
    expect(prisma.workout.findMany).not.toHaveBeenCalled();
    expect(result.results[0]).toMatchObject({
      type: "exercise",
      title: "Bench Press",
      metadata: { workoutId: "workout-1" },
    });
  });

  it("searches meals and foods by name", async () => {
    const prisma = createPrismaMock();
    prisma.meal.findMany.mockResolvedValue([
      {
        id: "meal-1",
        name: "Breakfast",
        eatenAt: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    prisma.foodItem.findMany.mockResolvedValue([
      {
        id: "food-1",
        name: "Greek Yogurt",
        servingSize: 200,
        calories: 150,
        protein: 20,
        carbs: 8,
        fat: 2,
        mealId: "meal-1",
        meal: { id: "meal-1", name: "Breakfast", eatenAt: now },
      },
    ]);
    const service = new SearchService(prisma as never);

    const result = await service.search({ q: "break", limit: 20, offset: 0 });

    expect(prisma.meal.findMany).toHaveBeenCalled();
    expect(prisma.foodItem.findMany).toHaveBeenCalled();
    expect(result.results.map((item) => item.type)).toEqual(["meal", "food"]);
  });

  it("applies limit and offset after ranking", async () => {
    const prisma = createPrismaMock();
    prisma.workout.findMany.mockResolvedValue([
      {
        id: "1",
        name: "Bench",
        createdAt: new Date("2026-07-04T07:00:00.000Z"),
        updatedAt: now,
      },
      {
        id: "2",
        name: "Bench Assistance",
        createdAt: new Date("2026-07-03T07:00:00.000Z"),
        updatedAt: now,
      },
      {
        id: "3",
        name: "Incline Bench",
        createdAt: new Date("2026-07-02T07:00:00.000Z"),
        updatedAt: now,
      },
    ]);
    const service = new SearchService(prisma as never);

    const result = await service.search({
      q: "bench",
      type: "workout",
      limit: 1,
      offset: 1,
    });

    expect(result.total).toBe(3);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].id).toBe("2");
  });

  it("searches training plan body text", async () => {
    const prisma = createPrismaMock();
    prisma.trainingPlan.findMany.mockResolvedValue([
      {
        id: "plan-1",
        goal: "Hypertrophy",
        experienceLevel: "intermediate",
        daysPerWeek: 4,
        plan: ["Full-body strength", "Conditioning intervals"],
        createdAt: now,
      },
    ]);
    const service = new SearchService(prisma as never);

    const result = await service.search({
      q: "conditioning",
      type: "training_plan",
      limit: 20,
      offset: 0,
    });

    expect(result.total).toBe(1);
    expect(result.results[0]).toMatchObject({
      id: "plan-1",
      type: "training_plan",
      title: "Hypertrophy training plan",
    });
  });

  it("returns no weight matches for non-numeric queries", async () => {
    const prisma = createPrismaMock();
    const service = new SearchService(prisma as never);

    const result = await service.search({
      q: "heavy",
      type: "weight",
      limit: 20,
      offset: 0,
    });

    expect(prisma.weightEntry.findMany).not.toHaveBeenCalled();
    expect(result).toMatchObject({ total: 0, results: [] });
  });
});
