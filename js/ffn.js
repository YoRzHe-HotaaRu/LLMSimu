/**
 * Feed-Forward Network Visualization Module
 * Visualizes the feed-forward neural network processing
 */
const FFNVisualizer = {
    container: null,
    layers: [],
    connections: [],

    /**
     * Initialize the FFN visualizer
     */
    init() {
        this.container = document.getElementById('ffn-display');
    },

    /**
     * Clear FFN display
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.layers = [];
        this.connections = [];
    },

    /**
     * Create the FFN structure HTML
     */
    createStructure() {
        const numLayers = CONFIG.visualization.ffnLayers;
        const neuronsPerLayer = CONFIG.visualization.ffnNeuronsPerLayer;

        let html = '';

        for (let l = 0; l < numLayers; l++) {
            // Layer neurons
            html += `
                <div class="ffn-layer" data-layer="${l}">
                    <div class="ffn-layer-label">${l === 0 ? 'Input' : l === numLayers - 1 ? 'Output' : `Hidden ${l}`}</div>
                    <div class="ffn-neurons">
            `;

            for (let n = 0; n < neuronsPerLayer; n++) {
                html += `<div class="ffn-neuron" data-layer="${l}" data-neuron="${n}"></div>`;
            }

            html += `</div></div>`;

            // Add connection lines between layers (except after last layer)
            if (l < numLayers - 1) {
                html += `
                    <div class="ffn-connections" data-from="${l}" data-to="${l + 1}">
                        <svg class="ffn-connection-svg" viewBox="0 0 60 100" preserveAspectRatio="none">
                            ${this.generateConnectionSVG(neuronsPerLayer)}
                        </svg>
                    </div>
                `;
            }
        }

        this.container.innerHTML = html;
    },

    /**
     * Generate SVG lines for connections between layers
     * @param {number} neurons - Number of neurons per layer
     * @returns {string} SVG path elements
     */
    generateConnectionSVG(neurons) {
        let paths = '';
        const spacing = 100 / (neurons + 1);

        for (let i = 0; i < neurons; i++) {
            for (let j = 0; j < neurons; j++) {
                const y1 = spacing * (i + 1);
                const y2 = spacing * (j + 1);
                paths += `<line 
                    class="ffn-connection-line" 
                    x1="0" y1="${y1}" 
                    x2="60" y2="${y2}" 
                    data-from="${i}" data-to="${j}"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="1"
                />`;
            }
        }

        return paths;
    },

    /**
     * Animate FFN processing
     * Shows data flowing through the network
     * @returns {Promise} Resolves when animation is complete
     */
    async animate() {
        return new Promise((resolve) => {
            this.clear();
            this.createStructure();

            const numLayers = CONFIG.visualization.ffnLayers;
            const neuronsPerLayer = CONFIG.visualization.ffnNeuronsPerLayer;
            const layerDelay = getTiming('ffnProcess') / numLayers;

            // Animate each layer sequentially
            const animateLayer = (layerIndex) => {
                if (layerIndex >= numLayers) {
                    // All done - keep output layer active briefly
                    setTimeout(resolve, layerDelay / 2);
                    return;
                }

                const neurons = document.querySelectorAll(`.ffn-neuron[data-layer="${layerIndex}"]`);
                const connections = document.querySelectorAll(`.ffn-connections[data-from="${layerIndex}"] .ffn-connection-line`);

                // Activate neurons with stagger
                neurons.forEach((neuron, i) => {
                    setTimeout(() => {
                        neuron.classList.add('active');

                        // Deactivate previous layer's neurons
                        if (layerIndex > 0) {
                            const prevNeurons = document.querySelectorAll(`.ffn-neuron[data-layer="${layerIndex - 1}"]`);
                            prevNeurons.forEach(n => n.classList.remove('active'));
                        }
                    }, i * (layerDelay / neuronsPerLayer / 2));
                });

                // Activate connections
                if (connections.length > 0) {
                    const connectionDelay = (layerDelay * 0.8) / connections.length;
                    connections.forEach((conn, i) => {
                        setTimeout(() => {
                            conn.setAttribute('stroke', 'rgba(0, 245, 255, 0.6)');
                            conn.style.filter = 'drop-shadow(0 0 3px rgba(0, 245, 255, 0.8))';

                            // Fade out after highlight
                            setTimeout(() => {
                                conn.setAttribute('stroke', 'rgba(0, 245, 255, 0.2)');
                                conn.style.filter = 'none';
                            }, connectionDelay * 2);
                        }, i * connectionDelay);
                    });
                }

                // Move to next layer
                setTimeout(() => animateLayer(layerIndex + 1), layerDelay);
            };

            // Start animation
            animateLayer(0);
        });
    },

    /**
     * Create a ripple effect on the FFN
     */
    ripple() {
        const neurons = document.querySelectorAll('.ffn-neuron');
        neurons.forEach((neuron, i) => {
            setTimeout(() => {
                neuron.style.animation = 'neuron-fire 0.5s ease';
                setTimeout(() => {
                    neuron.style.animation = '';
                }, 500);
            }, i * 50);
        });
    }
};
