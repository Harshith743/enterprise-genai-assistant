import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnterpriseAssistant } from './enterprise-assistant.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Assistant
const assistant = new EnterpriseAssistant();
let isReady = false;

console.log("🚀 Starting Enterprise GenAI Server...");
assistant.initialize().then(() => {
    isReady = true;
    console.log("✅ Assistant Initialized and Ready!");
}).catch(err => {
    console.error("❌ Failed to initialize assistant:", err);
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health Check
app.get('/api/health', (req, res) => {
    if (isReady) {
        res.json({ status: 'ok' });
    } else {
        res.status(503).json({ status: 'initializing' });
    }
});

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    if (!isReady) {
        return res.status(503).json({ error: 'System is initializing, please wait...' });
    }

    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = await assistant.chat(query);
        res.json({ response });
    } catch (err) {
        console.error("Error processing query:", err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`\n🌐 Web Interface running at http://localhost:${PORT}`);
});
