/**
 * Attention Visualization Module
 * Visualizes self-attention weights between tokens
 */
const AttentionVisualizer = {
    canvas: null,
    ctx: null,
    tokens: [],
    attentionWeights: [],

    /**
     * Initialize the attention visualizer
     */
    init() {
        this.canvas = document.getElementById('attention-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    },

    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        if (this.canvas) {
            const container = this.canvas.parentElement;
            const dpr = window.devicePixelRatio || 1;

            this.canvas.width = container.clientWidth * dpr;
            this.canvas.height = container.clientHeight * dpr;
            this.canvas.style.width = container.clientWidth + 'px';
            this.canvas.style.height = container.clientHeight + 'px';

            this.ctx.scale(dpr, dpr);
        }
    },

    /**
     * Clear the canvas
     */
    clear() {
        if (this.ctx && this.canvas) {
            const container = this.canvas.parentElement;
            this.ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
        }
        this.tokens = [];
        this.attentionWeights = [];
    },

    /**
     * Generate mock attention weights
     * Creates a matrix where each token attends to all previous tokens
     * @param {string[]} tokens - Array of tokens
     * @returns {number[][]} Attention weight matrix
     */
    generateAttentionWeights(tokens) {
        const n = Math.min(tokens.length, CONFIG.visualization.attentionMaxTokens);
        this.tokens = tokens.slice(0, n);
        this.attentionWeights = [];

        for (let i = 0; i < n; i++) {
            const row = [];
            for (let j = 0; j < n; j++) {
                if (j <= i) {
                    // Generate attention weight (higher for nearby tokens)
                    const distance = i - j;
                    const baseWeight = Math.exp(-distance * 0.3);
                    const noise = 0.3 * Math.random();
                    row.push(Math.min(1, baseWeight + noise));
                } else {
                    // Causal masking - can't attend to future tokens
                    row.push(0);
                }
            }
            // Normalize row (softmax simulation)
            const sum = row.reduce((a, b) => a + b, 0);
            this.attentionWeights.push(row.map(w => w / sum));
        }

        return this.attentionWeights;
    },

    /**
     * Animate attention visualization
     * @param {string[]} tokens - Array of tokens
     * @returns {Promise} Resolves when animation is complete
     */
    async animate(tokens) {
        return new Promise((resolve) => {
            this.clear();
            this.resizeCanvas();
            this.generateAttentionWeights(tokens);

            const container = this.canvas.parentElement;
            const width = container.clientWidth;
            const height = container.clientHeight;
            const n = this.tokens.length;

            if (n === 0) {
                resolve();
                return;
            }

            const padding = 60;
            const cellWidth = (width - padding * 2) / n;
            const cellHeight = (height - padding * 2) / n;

            // Draw grid cells with animation
            let currentCell = 0;
            const totalCells = n * n;
            const cellDelay = getTiming('attentionDraw') / totalCells;

            const drawCell = () => {
                if (currentCell >= totalCells) {
                    // Draw token labels
                    this.drawLabels(width, height, padding, cellWidth, cellHeight);
                    setTimeout(resolve, 200);
                    return;
                }

                const i = Math.floor(currentCell / n);
                const j = currentCell % n;
                const weight = this.attentionWeights[i][j];

                const x = padding + j * cellWidth;
                const y = padding + i * cellHeight;

                // Draw cell with color based on attention weight
                const alpha = weight;
                this.ctx.fillStyle = `rgba(0, 245, 255, ${alpha})`;
                this.ctx.fillRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);

                // Draw border
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.strokeRect(x, y, cellWidth, cellHeight);

                currentCell++;
                setTimeout(drawCell, cellDelay);
            };

            // Start drawing background
            this.ctx.fillStyle = 'rgba(10, 10, 15, 0.5)';
            this.ctx.fillRect(0, 0, width, height);

            drawCell();
        });
    },

    /**
     * Draw token labels around the attention matrix
     */
    drawLabels(width, height, padding, cellWidth, cellHeight) {
        this.ctx.font = '10px JetBrains Mono, monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.tokens.forEach((token, i) => {
            const label = token.length > 4 ? token.slice(0, 4) : token;

            // Top labels (columns - Keys)
            this.ctx.fillStyle = 'rgba(0, 245, 255, 0.7)';
            const xTop = padding + i * cellWidth + cellWidth / 2;
            this.ctx.save();
            this.ctx.translate(xTop, padding - 20);
            this.ctx.rotate(-Math.PI / 4);
            this.ctx.fillText(label, 0, 0);
            this.ctx.restore();

            // Left labels (rows - Queries)
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
            const yLeft = padding + i * cellHeight + cellHeight / 2;
            this.ctx.fillText(label, padding - 25, yLeft);
        });

        // Add legend
        this.ctx.fillStyle = 'rgba(160, 160, 176, 0.7)';
        this.ctx.font = '9px Inter, sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Low', width - 70, height - 10);
        this.ctx.fillText('High', width - 10, height - 10);

        // Legend gradient
        const gradient = this.ctx.createLinearGradient(width - 65, 0, width - 15, 0);
        gradient.addColorStop(0, 'rgba(0, 245, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 245, 255, 1)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(width - 65, height - 25, 50, 8);
    },

    /**
     * Get attention weights
     * @returns {number[][]} Attention weight matrix
     */
    getWeights() {
        return this.attentionWeights;
    }
};
