import handler from "../src/main";

export default async function vercelHandler(req: any, res: any) {
  const pathname = req?.url?.split("?")[0];

  if (pathname === "/api/health" || pathname === "/health") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        status: "ok",
        service: "fit-forge-backend",
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  if (pathname === "/favicon.ico") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    return await handler(req, res);
  } catch (error) {
    console.error("Vercel handler failed", error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          statusCode: 500,
          message: "FUNCTION_INVOCATION_FAILED",
        }),
      );
    }
  }
}
