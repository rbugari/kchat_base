# PRD — Bot Kargho (CLI + LLM con Tools) - v3 (Final)

## 1) Objetivo General

Construir y depurar un chatbot CLI multi-agente cuya lógica principal reside en los prompts del LLM, con un enfoque reciente en la mejora del razonamiento mediante el cambio de modelo LLM y la implementación de características avanzadas.

## 2) Estado Actual y Logros Clave

El proyecto ha alcanzado un estado robusto y funcional, incorporando las siguientes mejoras y características:

*   **Motor LLM Flexible:** Soporte para múltiples proveedores de LLM (`groq` y `openai`), configurable vía `.env`. El modelo activo actual es `gpt-4o-mini`, que ha resuelto problemas críticos de razonamiento y bucles en la conversación.

*   **Lógica en Prompts:** La lógica de negocio se mantiene estrictamente dentro de los prompts del LLM, permitiendo máxima flexibilidad y edición sin modificar el código base.

*   **Testing Data-Driven:** Implementación de un framework de pruebas robusto y data-driven, utilizando `test_data.json` para los escenarios y `test_scenarios.js` para la generación de mocks y pasos de prueba. `test_cli.js` orquesta la ejecución de las pruebas.

*   **Refactorización del CLI (`kargho_cli.js`):** Se ha refactorizado significativamente para usar un bucle de eventos estándar en lugar de un bucle recursivo, mejorando la estabilidad y el manejo del historial de conversación.

*   **Resúmenes de Herramientas Unívocos:** La función `summarizeToolResult` en `kargho_cli.js` ahora genera resúmenes de resultados de herramientas altamente específicos y sin ambigüedad (ej. `TOOL_RESULT: STATUS_ALREADY_REGISTERED` vs `TOOL_RESULT: STATUS_NOT_REGISTERED`), lo que ha eliminado la confusión del LLM en escenarios clave.

*   **Soporte Multilingüe:**
    *   **Prompts Externalizados:** Los prompts de los agentes se han movido a archivos Markdown (`.md`) externos, organizados por idioma (`prompts/es/`, `prompts/en/`). Esto facilita la edición por parte de no desarrolladores y la gestión de versiones.
    *   **Selección de Idioma Inicial:** El bot ahora pregunta al usuario su idioma preferido al inicio de la conversación, configurando la sesión automáticamente.
    *   **Política de Backup de Prompts:** Se ha establecido una política de backup automático con timestamp para los archivos de prompts (`.md`) antes de cada modificación, asegurando un historial de versiones y una red de seguridad.

*   **Informe de Inicio Mejorado:** El CLI ahora presenta un informe detallado al iniciar, mostrando el idioma activo, el proveedor y modelo LLM, el modo API (MOCK/ON-LINE), y una lista de agentes disponibles con sus herramientas asociadas.

*   **Resolución de Bugs Lógicos:** Todos los bugs de razonamiento y lógica previamente identificados (ej. escenario de registro exitoso, verificación de documentos pendientes) han sido depurados y verificados, resultando en un comportamiento del bot predecible y correcto en todos los flujos.

*   **Interfaz Web para Testing (Nuevo):**
    *   Se ha desarrollado una interfaz web (`kargho-web-frontend`) con un backend Express (`kargho-web-backend`) para facilitar las pruebas y la interacción de múltiples usuarios.
    *   El frontend muestra el informe de inicio del bot.
    *   Las respuestas del bot se muestran con colores según el agente activo.

*   **Mejoras en la Experiencia del Usuario (Nuevo):**
    *   **Introducción Inmediata del Agente INFO:** El agente INFO ahora se presenta y ofrece la selección de idioma inmediatamente al cargar la interfaz web, sin esperar la primera interacción del usuario.
    *   **Introducciones de Agente Claras:** Cada agente se presenta de forma clara al activarse o al recibir un handoff, explicando su función.
    *   **Retención de Contexto en Handoffs:** El agente ONBOARDING ahora utiliza el contexto (`dot_confirmed`) establecido por el agente INFO para evitar preguntas redundantes y guiar al usuario directamente al siguiente paso lógico (solicitud de DOT/email).
    *   **Mensajes de Éxito Precisos:** Se ha corregido la interpretación del resultado de la herramienta `registerCarrier` para que el bot informe correctamente el éxito del registro en lugar de un error.
    *   **Estabilidad Mejorada:** Se ha resuelto un problema de bucle en la lógica de handoff, asegurando un flujo de conversación estable.

*   **Despliegue Completo (Nuevo):**
    *   **Backend en Railway:** El backend de la aplicación (`kargho-web-backend`) ha sido desplegado exitosamente en Railway.
    *   **Frontend en Vercel:** La interfaz de usuario web (`kargho-web-frontend`) ha sido desplegada exitosamente en Vercel y se comunica correctamente con el backend en Railway.

## 3) Arquitectura y Componentes Clave

*   **`kargho_cli.js`:** Interfaz de línea de comandos principal, gestiona el estado de la sesión, el historial de conversación y la interacción con el LLM y las herramientas.
*   **`llm.js`:** Módulo de abstracción para la comunicación con los proveedores de LLM (Groq, OpenAI).
*   **`prompts.js`:** Ahora actúa como un cargador dinámico de prompts, leyendo el contenido de los archivos `.md` según el idioma y el agente activo.

*   **`tools.js`:** Implementa las funciones para interactuar con las APIs externas de Kargho, incluyendo un sistema de mocking configurable.
*   **`.env`:** Archivo para la configuración de variables sensibles y de entorno (ej. `LLM_PROVIDER`, `LLM_MODEL`, `MOCK_API`).
*   **`kargho-web-backend/`:** Servidor Express que expone una API `/chat` para la interacción del frontend y `/status` para el informe de inicio. Contiene la lógica central del bot (`bot_logic.js`).
*   **`kargho-web-frontend/`:** Interfaz de usuario web (HTML, CSS, JavaScript) para interactuar con el bot.

## 4) Estado de Sesión (RAM)

El estado de la sesión se mantiene en memoria y ahora incluye la preferencia de idioma del usuario y banderas de contexto.

```ts
type SessionState = {
  active_agent: "info" | "onboarding" | "clientes",
  dot: string | null,
  email: string | null,
  is_registered: boolean | null,
  pending_docs: Array<{doc: string, status: string}>,
  last_tool_result: any | null,
  language: "es" | "en", // Added language preference
  dot_confirmed?: boolean // Added for context retention
}

const conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = [];
```

## 5) Protocolo de Salida del LLM

El LLM debe devolver EXCLUSIVAMENTE un objeto JSON válido con las claves `say`, `control` y `call_tool`. Esto se fuerza mediante `response_format: json_object` en la llamada a la API del LLM y se refuerza en el prompt común.

## 6) Tools HTTP (Kargho)

Las herramientas HTTP para interactuar con las APIs de Kargho están implementadas en `tools.js`. Se ha resuelto el problema de la URL base hardcodeando temporalmente la `BASE_URL` para asegurar la funcionalidad, con la recomendación de investigar la carga desde variables de entorno para mayor flexibilidad.

## 7) Testing

El sistema cuenta con un robusto framework de testing data-driven:
*   **`test_data.json`:** Define los escenarios de prueba con entradas de usuario y expectativas.
*   **`test_scenarios.js`:** Genera los mocks de API y las configuraciones específicas para cada escenario.
*   **`test_cli.js`:** Orquesta la ejecución de las pruebas, simulando la interacción completa con el CLI y validando el comportamiento del bot.

## 8) Futuras Extensiones

*   Implementación de la traducción real de los prompts en inglés.
*   Persistencia del estado de la sesión (ej. base de datos) para conversaciones de larga duración.
*   Integración con otras plataformas de mensajería (ej. WhatsApp, Slack).
*   Manejo más sofisticado de errores y reintentos en las llamadas a herramientas.
