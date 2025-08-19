const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { generateScenario } = require('./test_scenarios.js');
const { setMockResponses } = require('./tools.js');

// 1. Cargar los datos de prueba
const testData = JSON.parse(fs.readFileSync(path.join(__dirname, 'test_data.json'), 'utf-8'));

// Función para ejecutar una única conversación de prueba
function runTestConversation(scenario) {
    return new Promise((resolve, reject) => {
        console.log(`\n====================================================================`);
        console.log(`[TEST] Iniciando: ${scenario.description}`);
        console.log(`====================================================================\n`);

        // Configurar los mocks para este escenario específico
        setMockResponses(scenario.mockResponses);

        const child = spawn('node', ['kargho_cli.js']);
        let currentOutput = '';
        let conversationIndex = 0;

        const conversation = [...scenario.user_inputs, '']; // Añadir un enter final para asegurar que el último output se muestre

        child.stdout.on('data', (data) => {
            const output = data.toString();
            process.stdout.write(output);
            currentOutput += output;

            if (currentOutput.includes('Tu:')) {
                if (conversationIndex < conversation.length) {
                    const nextInput = conversation[conversationIndex++];
                    // No imprimir el "Enviando" para la última entrada vacía
                    if (nextInput !== '' || conversationIndex < conversation.length) {
                        console.log(`[TEST] Enviando: ${nextInput}`);
                    }
                    child.stdin.write(`${nextInput}\n`);
                    currentOutput = '';
                } else {
                    child.stdin.end();
                }
            }
        });

        child.stderr.on('data', (data) => {
            console.error(`[STDERR] ${data}`);
        });

        child.on('close', (code) => {
            console.log(`[TEST] Finalizado: ${scenario.description} (Código: ${code})`);
            resolve();
        });

        child.on('error', (err) => {
            console.error(`[TEST] Error al iniciar el proceso para '${scenario.description}':`, err);
            reject(err);
        });
    });
}

// 3. Función principal para ejecutar todos los tests
async function runAllTests() {
    console.log('Iniciando todas las pruebas de escenario...');
    const scenarios = testData.map(generateScenario);

    for (const scenario of scenarios) {
        try {
            await runTestConversation(scenario);
        } catch (error) {
            console.error(`Error fatal ejecutando el escenario '${scenario.description}'. Abortando.`, error);
            break; // Detenerse si un escenario falla catastróficamente
        }
    }
    console.log('\n====================================================================');
    console.log('[TEST] Todas las pruebas han finalizado.');
    console.log('====================================================================');
}

runAllTests();