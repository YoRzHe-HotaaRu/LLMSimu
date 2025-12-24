/**
 * Output Visualization Module
 * Visualizes token probability distribution and token selection
 */
const OutputVisualizer = {
    container: null,
    currentTokens: [],

    /**
     * Initialize the output visualizer
     */
    init() {
        this.container = document.getElementById('output-probs');
    },

    /**
     * Clear output display
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.currentTokens = [];
    },

    /**
     * Generate mock probability distribution for next token
     * In reality, this would come from the model's softmax output
     * @param {string} selectedToken - The token that will be selected
     * @returns {Object[]} Array of token-probability pairs
     */
    generateDistribution(selectedToken) {
        const topK = CONFIG.visualization.topKOutputTokens;

        // Mock vocabulary tokens
        const vocabulary = [
            'The', 'a', 'is', 'in', 'to', 'and', 'of', 'that', 'for', 'it',
            'with', 'as', 'on', 'be', 'at', 'by', 'this', 'have', 'from', 'or',
            'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
            'about', 'who', 'get', 'which', 'when', 'make', 'can', 'like', 'time', 'just',
            'life', 'meaning', 'purpose', 'human', 'question', 'answer', 'exist', 'world', 'think', 'believe'
        ];

        // Ensure selected token is in the list
        if (selectedToken && !vocabulary.includes(selectedToken)) {
            vocabulary[0] = selectedToken;
        }

        // Generate probabilities (selected token gets highest)
        const probs = [];
        let remaining = 1.0;

        // Selected token gets 30-60% probability
        if (selectedToken) {
            const selectedProb = 0.3 + Math.random() * 0.3;
            probs.push({ token: selectedToken, probability: selectedProb, selected: true });
            remaining -= selectedProb;
        }

        // Generate other top-k tokens
        const otherTokens = vocabulary.filter(t => t !== selectedToken);
        for (let i = 0; i < topK - 1 && i < otherTokens.length; i++) {
            const prob = remaining * (0.5 ** (i + 1));
            probs.push({
                token: otherTokens[i],
                probability: prob,
                selected: false
            });
        }

        // Sort by probability descending
        probs.sort((a, b) => b.probability - a.probability);

        this.currentTokens = probs;
        return probs;
    },

    /**
     * Animate output token probabilities
     * @param {string} selectedToken - The token being generated
     * @returns {Promise} Resolves when animation is complete
     */
    async animate(selectedToken) {
        return new Promise((resolve) => {
            this.clear();

            const probs = this.generateDistribution(selectedToken);
            const delay = getTiming('outputTokenDelay') * 3;

            probs.forEach((item, index) => {
                const row = document.createElement('div');
                row.className = 'output-token-row';
                if (item.selected) {
                    row.classList.add('selected');
                }

                const percentage = (item.probability * 100).toFixed(1);

                row.innerHTML = `
                    <div class="output-token-text">"${item.token}"</div>
                    <div class="output-prob-bar-container">
                        <div class="output-prob-bar" style="width: 0%"></div>
                    </div>
                    <div class="output-prob-value">${percentage}%</div>
                `;

                this.container.appendChild(row);

                // Animate appearance and bar fill
                setTimeout(() => {
                    row.classList.add('visible');
                    const bar = row.querySelector('.output-prob-bar');
                    bar.style.width = `${item.probability * 100}%`;

                    if (index === probs.length - 1) {
                        // Show selected token indicator
                        setTimeout(() => {
                            if (selectedToken) {
                                const selectedEl = document.createElement('div');
                                selectedEl.className = 'selected-token';
                                selectedEl.textContent = selectedToken;
                                this.container.appendChild(selectedEl);
                            }
                            resolve();
                        }, delay);
                    }
                }, index * delay);
            });

            if (probs.length === 0) {
                resolve();
            }
        });
    },

    /**
     * Quick update for streaming (less animation)
     * @param {string} token - New token
     */
    quickUpdate(token) {
        // For streaming, we just flash the container briefly
        if (this.container) {
            this.container.style.opacity = '0.7';
            setTimeout(() => {
                this.container.style.opacity = '1';
            }, 50);
        }
    }
};
