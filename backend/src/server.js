const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');
const { seedDatabase } = require('./scripts/seed');

async function startServer() {
  try {
    console.log('🚀 Starting Custom Employee Portal Backend Server...');
    
    // Initialize PostgreSQL Database & Run Migrations
    await db.initializeDatabase();

    // Auto-seed default roles, permissions, and demo users if database is fresh
    await seedDatabase(false);

    const server = app.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(`✨ Employee Portal Backend running at: http://localhost:${env.PORT}`);
      console.log(`✨ Environment: ${env.NODE_ENV}`);
      console.log(`✨ Database Mode: ${db.isUsingEmulation() ? 'In-Memory PostgreSQL Engine' : 'Live PostgreSQL Server'}`);
      console.log(`✨ Zoho OAuth Configuration: ${process.env.ZOHO_CLIENT_ID ? 'Configured' : 'Unconfigured (Safe Demo Mode)'}`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown handling
    const shutdown = async () => {
      console.log('\n🛑 Gracefully shutting down server...');
      server.close(() => {
        console.log('Backend HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (err) {
    console.error('❌ Fatal error during server startup:', err);
    process.exit(1);
  }
}

startServer();
