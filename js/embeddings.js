/**
 * Embeddings Visualization Module
 * Visualizes token embeddings as vector bar charts
 */
const EmbeddingsVisualizer = {
    container: null,
    embeddings: [],

    /**
     * Initialize the embeddings visualizer
     */
    init() {
        this.container = document.getElementById('embeddings-display');
    },

    /**
     * Clear all embeddings from display
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.embeddings = [];
    },

    /**
     * Generate mock embeddings for tokens
     * In a real LLM, these would be high-dimensional vectors
     * @param {string[]} tokens - Array of tokens
     * @returns {Object[]} Array of embedding objects
     */
    generateEmbeddings(tokens) {
        const dims = CONFIG.visualization.embeddingDimensions;

        this.embeddings = tokens.map((token, index) => {
            // Generate pseudo-random but consistent values based on token
            const seed = this.hashToken(token);
            const values = [];

            for (let i = 0; i < dims; i++) {
                // Create a value between 0.1 and 1 using pseudo-random
                const val = 0.1 + 0.9 * ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
                values.push(val);
            }

            return {
                token: token,
                index: index,
                values: values
            };
        });

        return this.embeddings;
    },

    /**
     * Simple hash function for token
     * @param {string} token - Token string
     * @returns {number} Hash value
     */
    hashToken(token) {
        let hash = 0;
        for (let i = 0; i < token.length; i++) {
            const char = token.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    },

    /**
     * Animate embeddings appearing
     * @param {string[]} tokens - Array of tokens
     * @returns {Promise} Resolves when animation is complete
     */
    async animate(tokens) {
        return new Promise((resolve) => {
            this.clear();
            this.generateEmbeddings(tokens);

            // Limit display tokens for visualization
            const displayEmbeddings = this.embeddings.slice(0, CONFIG.visualization.attentionMaxTokens);

            displayEmbeddings.forEach((emb, index) => {
                const embEl = document.createElement('div');
                embEl.className = 'embedding';

                // Create bars HTML
                const barsHTML = emb.values.map((val, i) => {
                    const height = Math.round(val * 36) + 4; // 4-40px range
                    const hue = (i / emb.values.length) * 180 + 180; // Cyan to magenta range
                    return `<div class="embedding-bar" style="height: ${height}px; background: hsl(${hue}, 100%, 60%);"></div>`;
                }).join('');

                // Token label (truncated if too long)
                const label = emb.token.length > 6 ? emb.token.slice(0, 6) + '…' : emb.token;

                embEl.innerHTML = `
                    <div class="embedding-bars">${barsHTML}</div>
                    <div class="embedding-label">${label}</div>
                `;

                this.container.appendChild(embEl);

                // Staggered animation
                setTimeout(() => {
                    embEl.classList.add('visible');

                    if (index === displayEmbeddings.length - 1) {
                        setTimeout(resolve, getTiming('embeddingBuild') / 2);
                    }
                }, index * (getTiming('embeddingBuild') / displayEmbeddings.length));
            });

            if (displayEmbeddings.length === 0) {
                resolve();
            }
        });
    },

    /**
     * Get embeddings data
     * @returns {Object[]} Embeddings array
     */
    getEmbeddings() {
        return this.embeddings;
    }
};
