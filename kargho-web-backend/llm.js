const Groq = require('groq-sdk');
const OpenAI = require('openai');

// Initialize clients based on environment variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getLLMResponse(systemPrompt, conversationHistory, currentState) {
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Estado actual: ${JSON.stringify(currentState)}` },
        ...conversationHistory
    ];

    const provider = process.env.LLM_PROVIDER || 'groq';
    const model = process.env.LLM_MODEL || 'llama3-70b-8192';

    try {
        let chatCompletion;

        if (provider === 'openai') {
            chatCompletion = await openai.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0,
                max_tokens: 1024,
                top_p: 1,
                stop: null,
                stream: false,
                response_format: { type: "json_object" },
            });
        } else { // Default to groq
            chatCompletion = await groq.chat.completions.create({
                messages: messages,
                model: model,
                temperature: 0,
                max_tokens: 1024,
                top_p: 1,
                stop: null,
                stream: false,
                response_format: { type: "json_object" },
            });
        }

        const llmResponse = chatCompletion.choices[0]?.message?.content;
        if (!llmResponse) {
            throw new Error('La respuesta del LLM está vacía.');
        }

        return JSON.parse(llmResponse);

    } catch (error) {
        console.error("Error al obtener o parsear la respuesta del LLM:", error);
        return {
            say: "Hubo un problema procesando tu solicitud. Por favor, intenta de nuevo.",
            control: { handoff_to: null, set: {} },
            call_tool: { name: null, args: {} }
        };
    }
}

module.exports = { getLLMResponse };
