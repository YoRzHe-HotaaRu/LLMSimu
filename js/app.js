/**
 * Main Application Controller
 * Orchestrates the neural network simulation visualization
 */
const App = {
    // State
    isProcessing: false,
    currentSpeed: 1,
    currentView: 'layers', // 'layers' or 'network'

    // DOM Elements
    elements: {
        input: null,
        submitBtn: null,
        resetBtn: null,
        speedBtns: null,
        responseOutput: null,
        responseCursor: null,
        viewTabs: null,
        viewContents: null,
        layers: {}
    },

    /**
     * Initialize the application
     */
    init() {
        // Cache DOM elements
        this.elements.input = document.getElementById('user-input');
        this.elements.submitBtn = document.getElementById('submit-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.speedBtns = document.querySelectorAll('.speed-btn');
        this.elements.responseOutput = document.getElementById('response-output');
        this.elements.responseCursor = document.getElementById('response-cursor');
        this.elements.viewTabs = document.querySelectorAll('.view-tab');
        this.elements.viewContents = document.querySelectorAll('.view-content');

        // Cache layer elements
        ['tokenization', 'embeddings', 'attention', 'ffn', 'output'].forEach(layer => {
            this.elements.layers[layer] = {
                container: document.getElementById(`layer-${layer}`),
                status: document.getElementById(`status-${layer}`)
            };
        });

        // Initialize visualizers
        TokenizerVisualizer.init();
        EmbeddingsVisualizer.init();
        AttentionVisualizer.init();
        FFNVisualizer.init();
        OutputVisualizer.init();
        NetworkDiagram.init();

        // Bind events
        this.bindEvents();

        console.log('🧠 LLM Neural Simulation initialized');
    },

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Submit button
        this.elements.submitBtn.addEventListener('click', () => this.process());

        // Enter key to submit
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.process();
            }
        });

        // Reset button
        this.elements.resetBtn.addEventListener('click', () => this.reset());

        // Speed buttons
        this.elements.speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const speed = parseFloat(btn.textContent);
                this.setSpeed(speed);

                // Update active state
                this.elements.speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // View tab switching
        this.elements.viewTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.dataset.view;
                this.switchView(view);
            });
        });
    },

    /**
     * Switch between Layer View and Network View
     * @param {string} view - 'layers' or 'network'
     */
    switchView(view) {
        this.currentView = view;

        // Update tab active states
        this.elements.viewTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.view === view);
        });

        // Update content visibility
        this.elements.viewContents.forEach(content => {
            const isActive = content.id === `${view}-view` ||
                (view === 'layers' && content.id === 'layers-view') ||
                (view === 'network' && content.id === 'network-view');
            content.classList.toggle('active', isActive);
        });
    },

    /**
     * Set animation speed
     * @param {number} speed - Speed multiplier
     */
    setSpeed(speed) {
        this.currentSpeed = speed;
        setSpeed(speed);
    },

    /**
     * Update layer status
     * @param {string} layer - Layer name
     * @param {string} status - 'waiting', 'active', 'completed'
     * @param {string} text - Status text
     */
    updateLayerStatus(layer, status, text) {
        const layerEl = this.elements.layers[layer];
        if (!layerEl) return;

        // Update container classes
        layerEl.container.classList.remove('active', 'completed');
        if (status !== 'waiting') {
            layerEl.container.classList.add(status);
        }

        // Update status text
        if (layerEl.status) {
            layerEl.status.textContent = text || status.charAt(0).toUpperCase() + status.slice(1);
        }
    },

    /**
     * Reset all visualizations
     */
    reset() {
        // Reset layer statuses
        Object.keys(this.elements.layers).forEach(layer => {
            this.updateLayerStatus(layer, 'waiting', 'Waiting');
        });

        // Clear visualizers
        TokenizerVisualizer.clear();
        EmbeddingsVisualizer.clear();
        AttentionVisualizer.clear();
        FFNVisualizer.clear();
        OutputVisualizer.clear();
        NetworkDiagram.clear();

        // Clear response
        this.elements.responseOutput.textContent = '';
        this.elements.responseCursor.classList.remove('active');

        // Re-enable input
        this.elements.submitBtn.disabled = false;
        this.isProcessing = false;
    },

    /**
     * Main processing pipeline
     */
    async process() {
        if (this.isProcessing) return;

        const prompt = this.elements.input.value.trim();
        if (!prompt) return;

        this.isProcessing = true;
        this.elements.submitBtn.disabled = true;

        // Reset previous state
        this.reset();
        this.elements.submitBtn.disabled = true;
        this.isProcessing = true;

        try {
            // Run network diagram animation in parallel if in network view
            const networkPromise = this.currentView === 'network'
                ? NetworkDiagram.animate(TokenizerVisualizer.getTokens().length || 5)
                : Promise.resolve();

            // Step 1: Tokenization
            await this.runTokenization(prompt);

            // If in layers view, also trigger network animation now that we have tokens
            if (this.currentView === 'layers') {
                NetworkDiagram.animate(TokenizerVisualizer.getTokens().length);
            }

            // Step 2: Embeddings
            await this.runEmbeddings();

            // Step 3: Attention
            await this.runAttention();

            // Step 4: FFN
            await this.runFFN();

            // Step 5: Output Generation (streaming from API)
            await this.runOutputGeneration(prompt);

        } catch (error) {
            console.error('Processing error:', error);
            this.elements.responseOutput.textContent = `Error: ${error.message}`;
        } finally {
            this.isProcessing = false;
            this.elements.submitBtn.disabled = false;
            this.elements.responseCursor.classList.remove('active');
        }
    },

    /**
     * Step 1: Tokenization
     */
    async runTokenization(prompt) {
        this.updateLayerStatus('tokenization', 'active', 'Processing');

        TokenizerVisualizer.tokenize(prompt);
        await TokenizerVisualizer.animate();

        this.updateLayerStatus('tokenization', 'completed', `${TokenizerVisualizer.getTokens().length} tokens`);
        await this.delay(getTiming('layerTransition'));
    },

    /**
     * Step 2: Embeddings
     */
    async runEmbeddings() {
        this.updateLayerStatus('embeddings', 'active', 'Encoding');

        const tokens = TokenizerVisualizer.getTokens();
        await EmbeddingsVisualizer.animate(tokens);

        this.updateLayerStatus('embeddings', 'completed', 'Encoded');
        await this.delay(getTiming('layerTransition'));
    },

    /**
     * Step 3: Attention
     */
    async runAttention() {
        this.updateLayerStatus('attention', 'active', 'Computing');

        const tokens = TokenizerVisualizer.getTokens();
        await AttentionVisualizer.animate(tokens);

        this.updateLayerStatus('attention', 'completed', 'Computed');
        await this.delay(getTiming('layerTransition'));
    },

    /**
     * Step 4: FFN
     */
    async runFFN() {
        this.updateLayerStatus('ffn', 'active', 'Processing');

        await FFNVisualizer.animate();

        this.updateLayerStatus('ffn', 'completed', 'Processed');
        await this.delay(getTiming('layerTransition'));
    },

    /**
     * Step 5: Output Generation with API streaming
     */
    async runOutputGeneration(prompt) {
        return new Promise((resolve, reject) => {
            this.updateLayerStatus('output', 'active', 'Generating');

            // Show cursor
            this.elements.responseCursor.classList.add('active');

            let tokenCount = 0;
            let firstToken = true;

            ZenMuxAPI.streamCompletion(
                prompt,
                // On each token
                (token) => {
                    tokenCount++;

                    // Append to response
                    this.elements.responseOutput.textContent += token;

                    // Show probability visualization for first few tokens
                    if (firstToken) {
                        firstToken = false;
                        OutputVisualizer.animate(token.trim());
                    } else {
                        OutputVisualizer.quickUpdate(token);
                    }

                    // Update status
                    this.updateLayerStatus('output', 'active', `${tokenCount} tokens`);
                },
                // On complete
                () => {
                    this.updateLayerStatus('output', 'completed', `${tokenCount} tokens`);
                    this.elements.responseCursor.classList.remove('active');
                    resolve();
                },
                // On error
                (error) => {
                    this.updateLayerStatus('output', 'waiting', 'Error');
                    reject(error);
                }
            );
        });
    },

    /**
     * Utility delay function
     * @param {number} ms - Milliseconds to delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
