// src/app.ts
import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import contactRoute from './routes/contactRoute';
import companyRoute from './routes/companyRoute';
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
    this.app.use(express.json());
  }

  private setupRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });
    this.app.use('/contact', contactRoute);
    this.app.use('/company', companyRoute);
  }

  private setupErrorHandling(): void {
    // Error handling middleware must be last
    this.app.use(errorHandler);
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log(`📝 Environment: ${config.env}`);
    });
  }
  
}