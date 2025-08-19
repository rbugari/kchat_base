const chatOutput = document.getElementById('chat-output');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// IMPORTANT: Replace with your deployed backend URL
const BACKEND_URL = 'http://localhost:3000'; // For local testing

let sessionId = localStorage.getItem('karghoSessionId');
if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('karghoSessionId', sessionId);
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerHTML = message; // Use innerHTML for rich content
    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight; // Scroll to bottom
}

async function sendMessage(initialMessage = null) { // Added initialMessage parameter
    const message = initialMessage !== null ? initialMessage : userInput.value.trim(); // Use initialMessage if provided
    if (message === '' && initialMessage === null) return; // Only return if no message and not an initial call

    if (initialMessage === null) { // Only append user message if it's not an initial call
        appendMessage('user', `Tu: ${message}`);
        userInput.value = '';
    }
    
    userInput.disabled = true;
    sendButton.disabled = true;

    try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput: message, sessionId: sessionId }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        appendMessage('bot', `Bot: ${data.botResponse}`);
    } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('bot', 'Bot: Error al conectar con el servidor. Intenta de nuevo más tarde.');
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

sendButton.addEventListener('click', () => sendMessage()); // Call without initialMessage
userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage(); // Call without initialMessage
    }
});

// Function to fetch and display startup report
async function displayStartupReport() {
    try {
        const response = await fetch(`${BACKEND_URL}/status`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const status = await response.json();

        let reportHtml = `
            <div class="startup-report">
                <p><strong>Bot Kargho Iniciado</strong></p>
                <p>Idioma: ${status.language.toUpperCase()} | Proveedor LLM: ${status.llmProvider} | Modelo LLM: ${status.llmModel} | Modo API: ${status.apiMode}</p>
                <p><strong>Agentes Disponibles:</strong></p>
                <ul>
        `;

        status.agents.forEach(agent => {
            reportHtml += `
                <li>
                    <span class="agent-${agent.name}">${agent.emoji} ${agent.name.toUpperCase()}</span>: ${agent.description}
            `;
            if (agent.tools.length > 0) {
                reportHtml += `<span> (Tools: ${agent.tools.join(', ')})</span>`;
            }
            reportHtml += `</li>`;
        });

        reportHtml += `
                </ul>
            </div>
        `;
        appendMessage('bot', reportHtml);
    } catch (error) {
        console.error('Error fetching startup report:', error);
        appendMessage('bot', 'Bot: Error al cargar el informe de inicio.');
    }
}

// Call displayStartupReport on page load
displayStartupReport();

// Trigger initial message from bot after startup report is displayed
window.addEventListener('load', () => {
    // A small delay to ensure displayStartupReport has rendered
    setTimeout(() => sendMessage(''), 100); // Send empty message to trigger initial bot response
});