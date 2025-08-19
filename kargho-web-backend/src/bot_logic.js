const { getLLMResponse } = require('../llm'); // Adjusted path
const { getPromptByAgent } = require('../prompts'); // Adjusted path
const tools = require('../tools'); // Adjusted path
const { colors } = require('./startup_report'); // Import colors from new module

// --- Helper Functions ---
function summarizeToolResult(toolName, toolResult) {
    switch (toolName) {
        case 'findByDotEmail':
            if (toolResult.error) return `TOOL_ERROR: ${toolResult.error}`;
            if (toolResult.is_registered_carrier) return `TOOL_RESULT: STATUS_ALREADY_REGISTERED`;
            return `TOOL_RESULT: STATUS_NOT_REGISTERED`;
        case 'registerCarrier':
            // Removed console.log
            if (toolResult.error && toolResult.error_code === 409) return `TOOL_RESULT: REGISTRATION_CONFLICT_DOT_EXISTS`;
            if (toolResult.message && toolResult.message.includes('exitosamente')) return `TOOL_RESULT: REGISTRATION_SUCCESSFUL`; // MODIFIED
            return `TOOL_ERROR: ${JSON.stringify(toolResult.error)}`;
        case 'pendingDocuments':
            if (toolResult.error) return `TOOL_ERROR: ${toolResult.error}`;
            if (toolResult.documents && toolResult.documents.length > 0) return `TOOL_RESULT: PENDING_DOCS_FOUND: ${JSON.stringify(toolResult.documents)}`;
            return `TOOL_RESULT: NO_PENDING_DOCS`;
        default:
            return `Resultado de ${toolName}: ${JSON.stringify(toolResult)}`;
    }
}

// --- Main Application Logic ---
async function handleUserInput(userInput, currentSessionState, currentConversationHistory) {
    let sessionState = { ...currentSessionState }; // Create a mutable copy
    let conversationHistory = [...currentConversationHistory]; // Create a mutable copy
    let botResponse = { say: '', control: {}, call_tool: {} }; // Default response structure

    // Initial language selection logic (only if it's the very first input)
    if (conversationHistory.length === 0 && sessionState.active_agent === 'info') { // Only apply if agent is info and no history
        const lowerInput = userInput.toLowerCase().trim();
        if (lowerInput === 'español') {
            sessionState.language = 'es';
        } else if (lowerInput === 'english') {
            sessionState.language = 'en';
        }
        // If not a valid language choice, the prompt will handle repeating the question
    }

    // Handle special commands (only /agente remains)
    if (userInput.startsWith('/')) {
        const [command, ...args] = userInput.substring(1).split(' ');
        switch (command) {
            case 'agente':
                const newAgent = args[0];
                if (['info', 'onboarding', 'clientes'].includes(newAgent)) {
                    sessionState.active_agent = newAgent;
                    conversationHistory = []; // Clear history on agent switch
                    botResponse.say = `Agente cambiado a: <span class="agent-${newAgent}">${newAgent.toUpperCase()}</span>`; // Inform user with color
                }
                return { sessionState, conversationHistory, botResponse }; // Return early for commands
        }
    }

    conversationHistory.push({ role: 'user', content: userInput });

    const currentPrompt = getPromptByAgent(sessionState.active_agent, sessionState.language);
    const llmResponse = await getLLMResponse(currentPrompt, conversationHistory, sessionState);

    // 1. Say
    if (llmResponse.say) {
        // Wrap the entire bot response in a span with the active agent's class for coloring
        botResponse.say = `<span class="agent-${sessionState.active_agent}">${llmResponse.say}</span>`;
        conversationHistory.push({ role: 'assistant', content: llmResponse.say });
    }

    // 2. Update State
    if (llmResponse.control && llmResponse.control.set) {
        sessionState = { ...sessionState, ...llmResponse.control.set };
    }

    // 3. Handoff
    if (llmResponse.control && llmResponse.control.handoff_to) {
        sessionState.active_agent = llmResponse.control.handoff_to;
        conversationHistory = []; // Clear history on handoff
        // The handoff message itself should also be colored
        botResponse.say += `\n... Handoff al agente: <span class="agent-${sessionState.active_agent}">${sessionState.active_agent.toUpperCase()}</span> ...`; // Append handoff message with color

        // After handoff, immediately get the new agent's introduction
        const newAgentPrompt = getPromptByAgent(sessionState.active_agent, sessionState.language);
        const newAgentIntroLLMResponse = await getLLMResponse(newAgentPrompt, [], sessionState); // Empty history for introduction
        if (newAgentIntroLLMResponse.say) {
            botResponse.say += `\n<span class="agent-${sessionState.active_agent}">${newAgentIntroLLMResponse.say}</span>`; // Append the introduction with color
            conversationHistory.push({ role: 'assistant', content: newAgentIntroLLMResponse.say }); // Add introduction to history
        }
    }

    // 4. Tool Call
    if (llmResponse.call_tool && llmResponse.call_tool.name) {
        const { name, args } = llmResponse.call_tool;
        if (tools[name]) {
            botResponse.say += `\n... Ejecutando tool: ${name} ...`; // Append tool execution message
            const toolResult = await tools[name](...Object.values(args));
            const toolResultSummary = summarizeToolResult(name, toolResult);
            // Recursive call for tool result processing
            const recursiveResult = await handleUserInput(toolResultSummary, sessionState, conversationHistory);
            sessionState = recursiveResult.sessionState;
            conversationHistory = recursiveResult.conversationHistory;
            botResponse = recursiveResult.botResponse;
        } else {
            botResponse.say += `\n> Error: La tool '${name}' no existe.`;
        }
    }

    return { sessionState, conversationHistory, botResponse };
}

module.exports = { handleUserInput };
