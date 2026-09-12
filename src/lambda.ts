import type { Handler } from "aws-lambda";
import serverlessExpress from "@codegenie/serverless-express";
import { createApp, expressApp } from "./main";

type AsyncLambdaHandler = (
  event: Parameters<Handler>[0],
  context: Parameters<Handler>[1],
) => Promise<unknown>;

let serverlessExpressInstance: AsyncLambdaHandler | undefined;

async function initializeHandler(): Promise<AsyncLambdaHandler> {
  await createApp();
  return serverlessExpress({ app: expressApp }) as unknown as AsyncLambdaHandler;
}

export const handler: Handler = async (event, context) => {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = await initializeHandler();
  }

  return serverlessExpressInstance(event, context);
};
