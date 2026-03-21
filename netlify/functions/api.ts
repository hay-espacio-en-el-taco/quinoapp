import serverless from "serverless-http";
import { app } from "../../server/app";
import { registerRoutes } from "../../server/routes";

let initialized = false;

async function initializeApp(): Promise<void> {
  if (initialized) return;

  await registerRoutes(app);

  // Replicate the error handler from runApp() in server/app.ts,
  // without calling server.listen() which is meaningless in serverless
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  initialized = true;
}

const initPromise = initializeApp();
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  await initPromise;
  return serverlessHandler(event, context);
};
