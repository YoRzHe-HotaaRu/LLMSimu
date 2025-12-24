/**
 * Tokenizer Visualization Module
 * Simulates tokenization of input text and animates the display
 */
const TokenizerVisualizer = {
    container: null,
    tokens: [],

    /**
     * Initialize the tokenizer visualizer
     */
    init() {
        this.container = document.getElementById('tokens-input');
    },

    /**
     * Clear all tokens from display
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.tokens = [];
    },

    /**
     * Simulate tokenization of input text
     * This is a simplified simulation - real LLM tokenizers are more complex
     * @param {string} text - Input text to tokenize
     * @returns {string[]} Array of tokens
     */
    tokenize(text) {
        // Simple tokenization simulation
        // Split by spaces and punctuation, keeping punctuation as separate tokens
        const rawTokens = text.match(/[\w']+|[.,!?;:'"()\[\]{}—–-]/g) || [];

        // Add special tokens
        this.tokens = ['<BOS>', ...rawTokens, '<EOS>'];
        return this.tokens;
    },

    /**
     * Animate tokens appearing one by one
     * @returns {Promise} Resolves when animation is complete
     */
    async animate() {
        return new Promise((resolve) => {
            this.container.innerHTML = '';

            this.tokens.forEach((token, index) => {
                const tokenEl = document.createElement('div');
                tokenEl.className = 'token';

                // Mark special tokens
                if (token === '<BOS>' || token === '<EOS>') {
                    tokenEl.classList.add('special');
                } else {
                    // Assign a color based on index
                    const colorIndex = index % CONFIG.tokenColors.length;
                    tokenEl.setAttribute('data-color', CONFIG.tokenColors[colorIndex]);
                }

                // Token content
                const displayText = token === '<BOS>' ? '⟨BOS⟩' :
                    token === '<EOS>' ? '⟨EOS⟩' : token;
                tokenEl.innerHTML = `
                    <span class="token-text">${displayText}</span>
                    <span class="token-index">${index}</span>
                `;

                this.container.appendChild(tokenEl);

                // Animate with delay
                setTimeout(() => {
                    tokenEl.classList.add('visible');

                    // Check if this is the last token
                    if (index === this.tokens.length - 1) {
                        setTimeout(resolve, getTiming('tokenDelay'));
                    }
                }, index * getTiming('tokenDelay'));
            });

            // Fallback resolve if no tokens
            if (this.tokens.length === 0) {
                resolve();
            }
        });
    },

    /**
     * Get current tokens
     * @returns {string[]} Current tokens array
     */
    getTokens() {
        return this.tokens;
    },

    /**
     * Get token count (excluding special tokens)
     * @returns {number} Token count
     */
    getTokenCount() {
        return this.tokens.filter(t => !t.startsWith('<')).length;
    }
};
