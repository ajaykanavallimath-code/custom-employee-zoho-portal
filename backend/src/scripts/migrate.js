const db = require('../config/db');

async function runStandaloneMigration() {
  console.log('🔄 Running database migrations...');
  try {
    await db.initializeDatabase();
    await db.runMigrations();
    console.log('✅ Migrations completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runStandaloneMigration();
}

module.exports = { runStandaloneMigration };
