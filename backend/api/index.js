const app = require('../app');
const db = require('../config/db');

let initialized = false;

async function initialize() {
    if (!initialized) {
        await db.initializeDatabase();
        initialized = true;
    }
}

module.exports = async (req, res) => {
    try {
        await initialize();
        return app(req, res);
    } catch (error) {
        console.error('Vercel backend initialization error:', error);

        return res.status(500).json({
            success: false,
            message: 'Backend initialization failed',
            error: process.env.NODE_ENV === 'development'
                ? error.message
                : undefined
        });
    }
};