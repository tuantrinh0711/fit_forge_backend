import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function createApp() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = new Set([
    "https://output-lemon-limb.ngrok-free.dev",
    "http://192.168.1.71:8081",
  ]);
  const isLocalDevelopmentOrigin = (origin: string) => {
    try {
      const url = new URL(origin);
      return (
        (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
        (url.protocol === "http:" || url.protocol === "https:")
      );
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.has(origin) ||
        origin.endsWith(".ngrok-free.dev") ||
        isLocalDevelopmentOrigin(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS blocked for origin: " + origin));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "Origin",
      "X-Requested-With",
      "ngrok-skip-browser-warning",
    ],
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Fit Forge API")
    .setDescription(
      "API for workout tracking, nutrition, goals, progress, reports, and training plans.",
    )
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    jsonDocumentUrl: "api/docs-json",
  });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

if (!process.env.VERCEL) {
  void bootstrap();
}

export default async function handler(req: any, res: any) {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance()(req, res);
}
