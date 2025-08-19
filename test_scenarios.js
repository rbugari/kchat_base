function generateScenario(data) {
    const baseMocks = {
        '/api/fmcsa/pending-documents': {
            documents: [{ doc: 'W9 Form', status: 'Pending' }]
        },
        '/api/fmcsa/register-carrier': {
            message: 'Carrier registered successfully.'
        }
    };

    switch (data.scenario_type) {
        case 'EXISTING_CLIENT':
            return {
                ...data,
                mockResponses: {
                    ...baseMocks,
                    '/api/fmcsa/find-by-dot-email': {
                        is_registered_carrier: true,
                        dot_data: { legal_name: `Company for ${data.dot}`, telephone: '555-1111' }
                    }
                }
            };

        case 'NEW_CLIENT_SUCCESS':
            return {
                ...data,
                mockResponses: {
                    ...baseMocks,
                    '/api/fmcsa/find-by-dot-email': {
                        is_registered_carrier: false,
                        dot_data: { legal_name: `New Company ${data.dot}`, telephone: '555-2222' }
                    }
                }
            };

        case 'NEW_CLIENT_CONFLICT':
            return {
                ...data,
                mockResponses: {
                    ...baseMocks,
                    '/api/fmcsa/find-by-dot-email': {
                        is_registered_carrier: false,
                        dot_data: { legal_name: `Conflict Co ${data.dot}`, telephone: '555-3333' }
                    },
                    '/api/fmcsa/register-carrier': {
                        error: { message: 'DOT number is already registered with another carrier.' },
                        error_code: 409
                    }
                }
            };

        case 'NEW_CLIENT_NOT_FOUND':
            return {
                ...data,
                mockResponses: {
                    ...baseMocks,
                    '/api/fmcsa/find-by-dot-email': {
                        error: { message: 'DOT number not found in FMCSA database.' },
                        error_code: 404
                    }
                }
            };

        case 'LANGUAGE_SWITCH':
            return {
                ...data,
                mockResponses: {} // No specific mocks needed for language switching
            };

        case 'INITIAL_LANG_ES':
        case 'INITIAL_LANG_EN':
        case 'INITIAL_LANG_INVALID':
            return {
                ...data,
                mockResponses: {} // No specific mocks needed for initial language selection
            };

        default:
            throw new Error(`Unknown scenario type: ${data.scenario_type}`);
    }
}

module.exports = { generateScenario };
