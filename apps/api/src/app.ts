import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import env from "@/shared/constants/env";
import errorHandler from "./shared/middleware/errorHandler";

export interface Route {
  path: string;
  router: express.Router;
}

class App {
  private app: express.Application;

  constructor(routes: Route[]) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes(routes);
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    this.app.use(
      cors({
        origin: env.get("APP_ORIGIN"),
        credentials: true,
      }),
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.set("trust proxy", 1);
  }

  private setupRoutes(routes: Route[]) {
    routes.forEach((route) => this.app.use(route.path, route.router));
  }

  private setupErrorHandling() {
    this.app.use(errorHandler);
  }

  public startServer() {
    const port = env.get("PORT");
    this.app.listen(port, () => {
      console.info(`Server is running on port ${port}`);
    });
  }
}
export default App;
