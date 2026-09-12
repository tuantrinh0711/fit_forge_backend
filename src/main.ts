import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import express from "express";
import { AppModule } from "./app.module";

export const expressApp = express();
let serverPromise: Promise<unknown> | undefined;

export async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = new Set([
    "https://output-lemon-limb.ngrok-free.dev",
    "http://192.168.1.71:8081",
    ...configuredOrigins,
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

  if (!process.env.VERCEL) {
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
  }

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  void bootstrap();
}

export default async function handler(req: any, res: any) {
  if (req.url === "/favicon.ico") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (!serverPromise) {
    serverPromise = createApp()
      .then((app) => app.init())
      .catch((error) => {
        serverPromise = undefined;
        throw error;
      });
  }

  await serverPromise;
  return expressApp(req, res);
}
