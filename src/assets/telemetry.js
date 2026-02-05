/**
 * CISSP Tactical Vault - Telemetry Bridge
 * This file allows standalone HTML modules to communicate 
 * with the main React AI Diagnostic Layer.
 */

const VaultTelemetry = {
    /**
     * Sends a signal to the parent React application.
     * @param {string} concept - The CISSP Domain/Concept (e.g., 'RMF_STEP_1')
     * @param {boolean} isCorrect - Did the student get it right?
     * @param {string} detail - Extra context for the AI Mentor
     */
    send: function(concept, isCorrect, detail = "") {
        console.log(`[VAULT_JS] Sending: ${concept} | Success: ${isCorrect}`);
        
        window.parent.postMessage({
            type: 'VAULT_TELEMETRY',
            payload: {
                concept: concept,
                isCorrect: isCorrect,
                detail: detail
            }
        }, '*');
    }
};