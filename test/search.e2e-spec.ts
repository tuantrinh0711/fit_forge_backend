import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require("supertest");
import { Response } from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("SearchController (e2e)", () => {
  let app: INestApplication;

  const getHttpServer = (): Parameters<typeof request>[0] =>
    app.getHttpServer() as Parameters<typeof request>[0];

  const prismaMock = {
    workout: { findMany: jest.fn() },
    workoutExercise: { findMany: jest.fn() },
    meal: { findMany: jest.fn() },
    foodItem: { findMany: jest.fn() },
    goal: { findMany: jest.fn() },
    weightEntry: { findMany: jest.fn() },
    trainingPlan: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    Object.values(prismaMock).forEach((model) => {
      model.findMany.mockResolvedValue([]);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("returns 200 for a valid query", async () => {
    await request(getHttpServer())
      .get("/api/search?q=bench")
      .expect(200)
      .expect((response: Response) => {
        expect(response.body).toMatchObject({
          query: "bench",
          limit: 20,
          offset: 0,
          total: 0,
          results: [],
        });
      });
  });

  it("returns 400 for an empty query", async () => {
    await request(getHttpServer()).get("/api/search?q=").expect(400);
  });

  it("returns 400 for an unknown type", async () => {
    await request(getHttpServer())
      .get("/api/search?q=bench&type=unknown")
      .expect(400);
  });

  it("returns an empty result set when no records match", async () => {
    await request(getHttpServer())
      .get("/api/search?q=missing&type=workout")
      .expect(200)
      .expect((response: Response) => {
        const body = response.body as { total: number; results: unknown[] };

        expect(body.total).toBe(0);
        expect(body.results).toEqual([]);
      });
  });
});
