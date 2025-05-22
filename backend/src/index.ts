
import dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

async function bootstrap() {
  
  try {
    const server = new App();
    const port = Number(process.env.PORT) || 3000;

    server.start(port);
    
    // Graceful shutdown
    const shutdown = async () => {
      console.log('🛑 Shutting down...');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

bootstrap().catch(console.error);