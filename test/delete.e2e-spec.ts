import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Delete endpoints (e2e)", () => {
  let app: INestApplication;
  const prismaMock = {
    workout: { deleteMany: jest.fn() },
    workoutExercise: { deleteMany: jest.fn() },
    workoutSet: { deleteMany: jest.fn() },
    meal: { deleteMany: jest.fn() },
    foodItem: { deleteMany: jest.fn() },
    goal: { deleteMany: jest.fn() },
    weightEntry: { deleteMany: jest.fn() },
    trainingPlan: { deleteMany: jest.fn() },
  };

  beforeEach(async () => {
    Object.values(prismaMock).forEach((model) =>
      model.deleteMany.mockResolvedValue({ count: 1 }),
    );
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => app.close());

  it.each([
    "/api/workouts/workout-1",
    "/api/workouts/workout-1/exercises/exercise-1",
    "/api/workouts/workout-1/exercises/exercise-1/sets/set-1",
    "/api/nutrition/meals/meal-1",
    "/api/nutrition/meals/meal-1/foods/food-1",
    "/api/goals/goal-1",
    "/api/progress/weights/weight-1",
    "/api/ai-plans/plan-1",
  ])("returns 204 when deleting %s", async (path) => {
    await request(app.getHttpServer()).delete(path).expect(204).expect("");
  });

  it("scopes an exercise delete to its workout", async () => {
    await request(app.getHttpServer())
      .delete("/api/workouts/workout-1/exercises/exercise-1")
      .expect(204);

    expect(prismaMock.workoutExercise.deleteMany).toHaveBeenCalledWith({
      where: { id: "exercise-1", workoutId: "workout-1" },
    });
  });

  it("returns 404 when the record does not exist", async () => {
    prismaMock.workout.deleteMany.mockResolvedValueOnce({ count: 0 });
    await request(app.getHttpServer())
      .delete("/api/workouts/missing")
      .expect(404);
  });
});
