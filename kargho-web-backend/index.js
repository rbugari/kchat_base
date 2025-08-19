require('dotenv').config({ path: '../.env' }); // Load .env from parent directory
const express = require('express');
const cors = require('cors');
const { handleUserInput } = require('./src/bot_logic'); // Import the bot logic
const { agentReportData } = require('./src/startup_report'); // Import agentReportData

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory session store (for demonstration/test users)
// In a production environment, this would be a persistent store like Redis or a database
const sessions = new Map(); // Map<sessionId, { sessionState, conversationHistory }>

app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Enable JSON body parsing

// API Endpoint for chat interaction
app.post('/chat', async (req, res) => {
    const { userInput, sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
    }

    // Get or create session
    let sessionData = sessions.get(sessionId);
    if (!sessionData) {
        sessionData = {
            sessionState: {
                active_agent: "info",
                dot: null,
                email: null,
                language: 'es' // Default language for new sessions
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

        // Update session data
        sessionData.sessionState = result.sessionState;
        sessionData.conversationHistory = result.conversationHistory;
        sessions.set(sessionId, sessionData); // Save updated session

        res.json({
            botResponse: result.botResponse.say,
            sessionState: result.sessionState // Optionally send back full state for debugging
        });
    } catch (error) {
        console.error('Error processing chat input:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// New API Endpoint for startup status
app.get('/status', (req, res) => {
    const isMock = process.env.MOCK_API === 'true';
    const mode = isMock ? 'MOCK (MOCK)' : 'ON-LINE';

    res.json({
        language: 'es', // Default language for initial display
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
});

// Basic health check endpoint
app.get('/', (req, res) => {
    res.send('Kargho Chatbot Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Kargho Chatbot Backend listening on port ${PORT}`);
    // printStartupReport("info", "es"); // This is now handled by the frontend
});
