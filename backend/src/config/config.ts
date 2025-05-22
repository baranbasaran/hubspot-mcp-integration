// src/config/config.ts
interface AppConfig {
    port: number;
    env: string;
    corsOptions: {
      origin: string[];
      credentials: boolean;
    };
  }
  
  export const config: AppConfig = {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOptions: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }
  };