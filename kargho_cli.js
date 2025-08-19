require('dotenv').config();
const readline = require('readline');
const { handleUserInput } = require('./kargho-web-backend/src/bot_logic');
const { printStartupReport, colors } = require('./kargho-web-backend/src/startup_report'); // Import from new module

// --- State and History ---
let sessionState = {
    active_agent: "info",
    dot: null,
    email: null,
    language: 'es'
};
let conversationHistory = [];

// --- CLI Interface ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// --- Application Start ---
function startChat() {
    printStartupReport(sessionState.active_agent, sessionState.language);
    rl.setPrompt('Tu: ');
    rl.prompt();

    rl.on('line', async (line) => {
        const result = await handleUserInput(line.trim(), sessionState, conversationHistory);
        sessionState = result.sessionState;
        conversationHistory = result.conversationHistory;
        console.log(`> ${result.botResponse.say}`); // Print bot's response
        rl.prompt();
    }).on('close', () => {
        console.log('Chat finalizado.');
        process.exit(0);
    });
}

startChat();