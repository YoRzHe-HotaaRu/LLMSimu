/**
 * Network Diagram Visualization Module
 * Creates and animates a classic neural network diagram with nodes and connections
 */
const NetworkDiagram = {
    svg: null,
    nodesGroup: null,
    connectionsGroup: null,
    particlesGroup: null,
    statusText: null,
    progressBar: null,

    // Network structure
    layers: [
        { name: 'input', nodes: 5, color: '#00f5ff' },      // Input (cyan)
        { name: 'embedding', nodes: 8, color: '#8855ff' },  // Embedding (purple)
        { name: 'hidden1', nodes: 10, color: '#ffffff' },   // Hidden 1 (white)
        { name: 'hidden2', nodes: 10, color: '#ffffff' },   // Hidden 2 (white)
        { name: 'hidden3', nodes: 8, color: '#ffffff' },    // Hidden 3 (white)
        { name: 'output', nodes: 3, color: '#00ff88' }      // Output (green)
    ],

    // Node positions cache
    nodePositions: [],

    // Animation state
    isAnimating: false,
    animationFrame: null,
    particles: [],

    /**
     * Initialize the network diagram
     */
    init() {
        this.svg = document.getElementById('network-svg');
        this.nodesGroup = document.getElementById('network-nodes');
        this.connectionsGroup = document.getElementById('network-connections');
        this.particlesGroup = document.getElementById('network-particles');
        this.statusText = document.getElementById('network-status-text');
        this.progressBar = document.getElementById('network-progress-bar');

        if (this.svg) {
            this.createNetwork();
        }
    },

    /**
     * Create the static network structure
     */
    createNetwork() {
        const viewBox = this.svg.viewBox.baseVal;
        const width = viewBox.width;
        const height = viewBox.height;
        const padding = 60;

        // Calculate layer positions
        const layerSpacing = (width - padding * 2) / (this.layers.length - 1);

        // Clear existing
        this.connectionsGroup.innerHTML = '';
        this.nodesGroup.innerHTML = '';
        this.nodePositions = [];

        // First pass: calculate all node positions
        this.layers.forEach((layer, layerIndex) => {
            const x = padding + layerIndex * layerSpacing;
            const nodeSpacing = (height - padding * 2) / (layer.nodes + 1);

            const layerNodes = [];
            for (let i = 0; i < layer.nodes; i++) {
                const y = padding + (i + 1) * nodeSpacing;
                layerNodes.push({ x, y, layer: layerIndex, index: i });
            }
            this.nodePositions.push(layerNodes);
        });

        // Second pass: draw connections
        for (let l = 0; l < this.layers.length - 1; l++) {
            const currentLayer = this.nodePositions[l];
            const nextLayer = this.nodePositions[l + 1];

            currentLayer.forEach((node, i) => {
                nextLayer.forEach((nextNode, j) => {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', node.x);
                    line.setAttribute('y1', node.y);
                    line.setAttribute('x2', nextNode.x);
                    line.setAttribute('y2', nextNode.y);
                    line.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
                    line.setAttribute('stroke-width', '1');
                    line.setAttribute('data-from-layer', l);
                    line.setAttribute('data-from-node', i);
                    line.setAttribute('data-to-layer', l + 1);
                    line.setAttribute('data-to-node', j);
                    line.classList.add('network-connection');
                    this.connectionsGroup.appendChild(line);
                });
            });
        }

        // Third pass: draw nodes
        this.layers.forEach((layer, layerIndex) => {
            this.nodePositions[layerIndex].forEach((pos, nodeIndex) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', pos.x);
                circle.setAttribute('cy', pos.y);
                circle.setAttribute('r', '12');
                circle.setAttribute('fill', 'rgba(10, 10, 15, 0.8)');
                circle.setAttribute('stroke', layer.color);
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('data-layer', layerIndex);
                circle.setAttribute('data-node', nodeIndex);
                circle.classList.add('network-node');
                this.nodesGroup.appendChild(circle);
            });
        });
    },

    /**
     * Update status text
     */
    setStatus(text) {
        if (this.statusText) {
            this.statusText.textContent = text;
        }
    },

    /**
     * Update progress bar
     */
    setProgress(percent) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
    },

    /**
     * Clear all animations and reset
     */
    clear() {
        this.isAnimating = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.particles = [];
        if (this.particlesGroup) {
            this.particlesGroup.innerHTML = '';
        }

        // Reset all nodes and connections
        document.querySelectorAll('.network-node').forEach(node => {
            node.classList.remove('active', 'pulse');
            node.setAttribute('fill', 'rgba(10, 10, 15, 0.8)');
        });

        document.querySelectorAll('.network-connection').forEach(conn => {
            conn.classList.remove('active');
            conn.setAttribute('stroke', 'rgba(255, 255, 255, 0.08)');
        });

        this.setStatus('Ready');
        this.setProgress(0);
    },

    /**
     * Animate data flowing through the network
     * @param {number} numTokens - Number of input tokens
     * @returns {Promise}
     */
    async animate(numTokens) {
        return new Promise((resolve) => {
            this.clear();
            this.isAnimating = true;

            const totalLayers = this.layers.length;
            const layerDelay = getTiming('ffnProcess') / totalLayers;

            // Animate layer by layer
            const animateLayer = (layerIndex) => {
                if (!this.isAnimating || layerIndex >= totalLayers) {
                    this.setStatus('Complete');
                    this.setProgress(100);
                    resolve();
                    return;
                }

                const progress = ((layerIndex + 1) / totalLayers) * 100;
                this.setProgress(progress);
                this.setStatus(`Processing ${this.layers[layerIndex].name}...`);

                // Activate nodes in this layer
                const nodes = document.querySelectorAll(`.network-node[data-layer="${layerIndex}"]`);
                nodes.forEach((node, i) => {
                    setTimeout(() => {
                        node.classList.add('active');
                        node.setAttribute('fill', this.layers[layerIndex].color);

                        // Create particles flowing to next layer
                        if (layerIndex < totalLayers - 1) {
                            this.createParticles(layerIndex, i);
                        }
                    }, i * 30);
                });

                // Activate connections from this layer
                if (layerIndex < totalLayers - 1) {
                    const connections = document.querySelectorAll(`.network-connection[data-from-layer="${layerIndex}"]`);
                    connections.forEach((conn, i) => {
                        setTimeout(() => {
                            conn.classList.add('active');
                            conn.setAttribute('stroke', `rgba(0, 245, 255, 0.4)`);
                        }, i * 5);
                    });
                }

                // Deactivate previous layer (fade)
                if (layerIndex > 0) {
                    setTimeout(() => {
                        const prevNodes = document.querySelectorAll(`.network-node[data-layer="${layerIndex - 1}"]`);
                        prevNodes.forEach(node => {
                            node.classList.remove('active');
                            const prevColor = this.layers[layerIndex - 1].color;
                            node.setAttribute('fill', this.hexToRgba(prevColor, 0.3));
                        });

                        const prevConns = document.querySelectorAll(`.network-connection[data-from-layer="${layerIndex - 1}"]`);
                        prevConns.forEach(conn => {
                            conn.classList.remove('active');
                            conn.setAttribute('stroke', 'rgba(0, 245, 255, 0.15)');
                        });
                    }, layerDelay * 0.5);
                }

                // Move to next layer
                setTimeout(() => animateLayer(layerIndex + 1), layerDelay);
            };

            // Start animation
            animateLayer(0);

            // Start particle animation loop
            this.animateParticles();
        });
    },

    /**
     * Create particles flowing from a node to the next layer
     */
    createParticles(fromLayer, fromNode) {
        const fromPos = this.nodePositions[fromLayer][fromNode];
        const toLayer = this.nodePositions[fromLayer + 1];

        // Create particles to random subset of next layer
        const numParticles = Math.min(3, toLayer.length);
        const targetIndices = this.shuffle([...Array(toLayer.length).keys()]).slice(0, numParticles);

        targetIndices.forEach((toIndex, i) => {
            const toPos = toLayer[toIndex];

            setTimeout(() => {
                const particle = {
                    x: fromPos.x,
                    y: fromPos.y,
                    targetX: toPos.x,
                    targetY: toPos.y,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.02,
                    element: null
                };

                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('r', '4');
                circle.setAttribute('fill', '#00f5ff');
                circle.classList.add('particle');
                circle.style.filter = 'drop-shadow(0 0 6px #00f5ff)';
                this.particlesGroup.appendChild(circle);

                particle.element = circle;
                this.particles.push(particle);
            }, i * 50);
        });
    },

    /**
     * Animate particles moving through the network
     */
    animateParticles() {
        const animate = () => {
            if (!this.isAnimating) return;

            this.particles = this.particles.filter(p => {
                p.progress += p.speed * CONFIG.speedMultiplier;

                if (p.progress >= 1) {
                    if (p.element && p.element.parentNode) {
                        p.element.parentNode.removeChild(p.element);
                    }
                    return false;
                }

                // Ease-in-out interpolation
                const t = p.progress;
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

                const x = p.x + (p.targetX - p.x) * ease;
                const y = p.y + (p.targetY - p.y) * ease;

                p.element.setAttribute('cx', x);
                p.element.setAttribute('cy', y);
                p.element.setAttribute('opacity', 1 - p.progress * 0.5);

                return true;
            });

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    },

    /**
     * Pulse a specific layer
     */
    pulseLayer(layerIndex) {
        const nodes = document.querySelectorAll(`.network-node[data-layer="${layerIndex}"]`);
        nodes.forEach(node => {
            node.classList.add('pulse');
            setTimeout(() => node.classList.remove('pulse'), 500);
        });
    },

    /**
     * Helper: Convert hex to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Helper: Shuffle array
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
