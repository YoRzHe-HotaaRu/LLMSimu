/**
 * Configuration for the LLM Neural Network Simulation
 */
const CONFIG = {
    // ZenMux API Configuration
    api: {
        baseUrl: 'https://zenmux.ai/api/v1',
        apiKey: 'your-key',
        model: 'xiaomi/mimo-v2-flash',
        maxTokens: 1024,
        temperature: 0.7,
        stream: true
    },
    
    // Animation timing (in milliseconds)
    timing: {
        tokenDelay: 100,        // Delay between each token appearing
        layerTransition: 500,   // Time to transition between layers
        embeddingBuild: 800,    // Time to build embedding visualization
        attentionDraw: 1000,    // Time to draw attention matrix
        ffnProcess: 1200,       // Time for FFN processing animation
        outputTokenDelay: 50    // Delay between output tokens
    },
    
    // Speed multiplier (controlled by speed buttons)
    speedMultiplier: 1,
    
    // Visualization settings
    visualization: {
        embeddingDimensions: 8,     // Number of bars to show for embeddings
        attentionMaxTokens: 12,     // Max tokens to show in attention visualization
        ffnLayers: 3,               // Number of FFN layers to visualize
        ffnNeuronsPerLayer: 5,      // Neurons per FFN layer
        topKOutputTokens: 5         // Top K tokens to show in output probabilities
    },
    
    // Token colors for visualization
    tokenColors: ['cyan', 'magenta', 'green', 'orange', 'purple']
};

/**
 * Get timing adjusted for current speed
 */
function getTiming(key) {
    return CONFIG.timing[key] / CONFIG.speedMultiplier;
}

/**
 * Set animation speed multiplier
 */
function setSpeed(multiplier) {
    CONFIG.speedMultiplier = multiplier;
    document.documentElement.style.setProperty('--speed-multiplier', 1 / multiplier);
}
