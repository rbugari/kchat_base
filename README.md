# Kargho Chatbot

## Project Overview

The Kargho Chatbot is a multi-agent conversational AI system designed to assist users with information about Kargho and guide them through processes like carrier onboarding. Its core logic is driven by Large Language Model (LLM) prompts, allowing for flexible and easily modifiable conversation flows. A key focus of this project has been to enhance LLM reasoning, implement advanced features, and provide a robust testing framework. Recently, a web-based interface has been developed to facilitate easier testing and interaction.

## Key Features

*   **Flexible LLM Engine:** Supports multiple LLM providers (Groq, OpenAI) configurable via `.env`. Currently uses `gpt-4o-mini` for improved reasoning and stability.
*   **Prompt-Driven Logic:** All business logic resides within LLM prompts, enabling non-developers to modify conversation flows without touching the codebase.
*   **Multilingual Support:**
    *   **Externalized Prompts:** Agent prompts are stored in external Markdown (`.md`) files, organized by language (`prompts/es/`, `prompts/en/`), simplifying content management and versioning.
    *   **Initial Language Selection:** The bot prompts the user for their preferred language at the start of the conversation.
    *   **Prompt Backup Policy:** Automatic timestamped backups of `.md` prompt files are created before modifications for version control and safety.
*   **Web-Based Interface for Testing:**
    *   A user-friendly web frontend (`kargho-web-frontend`) powered by an Express backend (`kargho-web-backend`) for easy interaction and testing.
    *   Displays a detailed startup report on load, including LLM configuration and available agents.
    *   Bot responses are color-coded based on the active agent for better visual clarity.
*   **Enhanced User Experience:**
    *   **Immediate Agent Introduction:** The initial INFO agent introduces itself and offers language selection as soon as the web interface loads.
    *   **Clear Agent Handoffs:** Agents clearly introduce themselves and their function upon activation or handoff.
    *   **Context Retention:** The bot intelligently retains context across agent handoffs (e.g., DOT confirmation), preventing redundant questions and streamlining the user journey.
    *   **Accurate Tool Feedback:** Correctly reports success messages from backend tools (e.g., carrier registration) instead of generic errors.
*   **Robust Testing Framework:**
    *   **Data-Driven Tests:** Uses `test_data.json` to define test scenarios.
    *   **Scenario Generation:** `test_scenarios.js` generates API mocks and test configurations.
    *   **Automated CLI Testing:** `test_cli.js` orchestrates full CLI interaction simulations and validates bot behavior.
*   **Stable Conversation Flow:** Critical reasoning bugs and looping issues have been resolved, ensuring predictable and correct bot behavior across all flows.

## Architecture and Key Components

*   **`kargho_cli.js`:** The original command-line interface, managing session state, conversation history, and interaction with the LLM and tools.
*   **`llm.js`:** Abstraction layer for communication with LLM providers (Groq, OpenAI).
*   **`prompts.js`:** Dynamic prompt loader, reading `.md` content based on active agent and language.
*   **`tools.js`:** Implements functions for interacting with external Kargho APIs, including a configurable mocking system.
*   **`.env`:** Environment configuration file for sensitive variables (e.g., `LLM_PROVIDER`, `LLM_MODEL`, `MOCK_API`).
*   **`kargho-web-backend/`:** Express server providing `/chat` API for frontend interaction and `/status` for startup reports. Contains core bot logic (`bot_logic.js`).
*   **`kargho-web-frontend/`:** Web user interface (HTML, CSS, JavaScript) for bot interaction.

## Setup and Usage

### Prerequisites

*   Node.js (LTS recommended)
*   npm (Node Package Manager)
*   Git (para CI/CD automático)
*   Cuentas en Railway y Vercel (para despliegue)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd karghoChat
    ```
2.  **Install backend dependencies:**
    ```bash
    cd kargho-web-backend
    npm install
    ```
3.  **Install root dependencies (for `llm.js`, `prompts.js`, `tools.js`):**
    ```bash
    cd .. # Go back to karghoChat root
    npm install
    ```
4.  **Configure Environment Variables:**
    *   Create a `.env` file in the `karghoChat` root directory.
    *   Add your LLM provider API keys and configuration. Example:
        ```
        LLM_PROVIDER=openai
        OPENAI_API_KEY=your_openai_api_key
        LLM_MODEL=gpt-4o-mini
        MOCK_API=true # Set to false for real API calls
        ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd kargho-web-backend
    node index.js
    ```
    You should see a message indicating the backend is listening on port 3000.

2.  **Open the Frontend:**
    *   Navigate to `karghoChat/kargho-web-frontend/index.html` in your web browser.
    *   The bot should immediately greet you and offer language selection.

### Interacting with the Bot

*   Type your messages in the input field and press Enter or click the "Send" button.
*   The bot will respond, with messages color-coded by the active agent.
*   Follow the conversation flow to explore different agent functionalities (INFO, ONBOARDING, CLIENTES).

### Testing

To run the automated tests:

```bash
cd karghoChat
npm test
```

This will execute the data-driven test scenarios and validate the bot's behavior.
