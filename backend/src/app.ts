// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express'; // Import Request, Response, NextFunction
import cors from 'cors';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import contactRoute from './routes/contactRoute';
import companyRoute from './routes/companyRoute';
import webhookRoute from './routes/webhookRoute';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.app.use(cors(config.corsOptions));
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    this.app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoute);

    this.app.use(express.json()); // This will apply to routes defined after this line

    this.app.use('/contact', contactRoute);
    this.app.use('/company', companyRoute);
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log(`📝 Environment: ${config.env}`);
    });
  }
}