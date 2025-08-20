require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { handleUserInput } = require('./src/bot_logic');
const { agentReportData } = require('./src/startup_report');

console.log("DEBUG: index.js - Script started."); // DEBUG LOG

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`DEBUG: index.js - PORT set to: ${PORT}`); // DEBUG LOG

const sessions = new Map();

app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
    console.log("DEBUG: index.js - /chat endpoint hit."); // DEBUG LOG
    const { userInput, sessionId } = req.body;

    if (!sessionId) {
        console.log("DEBUG: index.js - sessionId missing."); // DEBUG LOG
        return res.status(400).json({ error: 'sessionId is required' });
    }

    let sessionData = sessions.get(sessionId);
    if (!sessionData) {
        console.log(`DEBUG: index.js - New session created for ID: ${sessionId}`); // DEBUG LOG
        sessionData = {
            sessionState: {
                active_agent: "info",
                dot: null,
                email: null,
                language: 'es'
            },
            conversationHistory: []
        };
        sessions.set(sessionId, sessionData);
    }

    try {
        const result = await handleUserInput(
            userInput,
            sessionData.sessionState,
            sessionData.conversationHistory
        );

        sessionData.sessionState = result.sessionState;
        sessionData.conversationHistory = result.conversationHistory;
        sessions.set(sessionId, sessionData);

        res.json({
            botResponse: result.botResponse.say,
            sessionState: result.sessionState
        });
        console.log("DEBUG: index.js - /chat endpoint response sent."); // DEBUG LOG
    } catch (error) {
        console.error('DEBUG: index.js - Error processing chat input:', error); // DEBUG LOG
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    console.log("DEBUG: index.js - /health endpoint hit from:", req.get('User-Agent')); // DEBUG LOG
    res.status(200).json({
        status: 'OK',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime() + 's'
    });
    console.log("DEBUG: index.js - /health endpoint response sent."); // DEBUG LOG
});

app.get('/status', (req, res) => {
    console.log("DEBUG: index.js - /status endpoint hit."); // DEBUG LOG
    const isMock = process.env.MOCK_API === 'true';
    const mode = isMock ? 'MOCK (MOCK)' : 'ON-LINE';

    res.json({
        language: 'es',
        llmProvider: process.env.LLM_PROVIDER || 'groq',
        llmModel: process.env.LLM_MODEL || 'llama3-70b-8192',
        apiMode: mode,
        agents: agentReportData.map(agent => ({
            name: agent.name,
            emoji: agent.emoji,
            description: agent.description,
            tools: agent.tools
        }))
    });
    console.log("DEBUG: index.js - /status endpoint response sent."); // DEBUG LOG
});

app.get('/', (req, res) => {
    console.log("DEBUG: index.js - / endpoint hit."); // DEBUG LOG
    res.send('Kargho Chatbot Backend is running!');
});

const server = app.listen(PORT, () => {
    console.log(`Kargho Chatbot Backend listening on port ${PORT}`);
    console.log("DEBUG: index.js - Server started and listening."); // DEBUG LOG
    console.log("DEBUG: index.js - Script finished execution."); // DEBUG LOG
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`DEBUG: index.js - ${signal} received, shutting down gracefully`);
    console.log('DEBUG: index.js - Server uptime:', process.uptime() + 's');
    
    server.close((err) => {
        if (err) {
            console.error('DEBUG: index.js - Error during server close:', err);
            process.exit(1);
        }
        console.log('DEBUG: index.js - Server closed successfully');
        process.exit(0);
    });
    
    // Force close after 10 seconds
    setTimeout(() => {
        console.log('DEBUG: index.js - Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Keep the process alive and log errors
process.on('uncaughtException', (err) => {
    console.error('DEBUG: index.js - Uncaught Exception:', err);
    console.error('DEBUG: index.js - Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('DEBUG: index.js - Unhandled Rejection at:', promise, 'reason:', reason);
});

// Log process events for debugging
process.on('exit', (code) => {
    console.log(`DEBUG: index.js - Process exiting with code: ${code}`);
});

process.on('beforeExit', (code) => {
    console.log(`DEBUG: index.js - Process before exit with code: ${code}`);
});