const app = require('../app');
const db = require('../config/db');

let initialized = false;
let initializationPromise = null;

async function initialize() {
    if (initialized) return;

    if (!initializationPromise) {
        initializationPromise = db.initializeDatabase()
            .then(() => {
                initialized = true;
            })
            .catch((error) => {
                initializationPromise = null;
                throw error;
            });
    }

    await initializationPromise;
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
            error:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : undefined
        });
    }
};