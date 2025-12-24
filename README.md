# 🧠 LLM Neural Network Simulation

An interactive visualization that simulates the internal processes of a Large Language Model (LLM), from input tokens through various neural network layers to output generation.

![Demo](https://img.shields.io/badge/Demo-Live-00f5ff?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)

## ✨ Features

### Multi-Layer Visualization
- **Tokenization** - Watch text break down into tokens with colorful animated boxes
- **Embeddings** - See tokens transform into vector representations as animated bar charts
- **Self-Attention** - Visualize attention weights between tokens as an interactive heatmap matrix
- **Feed-Forward Network** - Abstract FFN processing with animated neurons and connections
- **Output Generation** - Token probability distributions and real-time streaming response

### Dual View System
| Layer View | Network View |
|------------|--------------|
| Step-by-step visualization of each processing layer | Classic neural network diagram with animated data flow |
| Detailed token and weight information | Particle effects showing information propagation |
| Interactive probability displays | Full network architecture overview |

### Interactive Controls
- ⚡ **Speed Controls** - Adjust animation speed (0.5x, 1x, 2x)
- 🔄 **Reset** - Clear all visualizations
- 💬 **Real-time Streaming** - Watch the LLM response generate token by token

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LLMSimu.git
   cd LLMSimu
   ```

2. **Start a local server**
   ```bash
   npx -y serve .
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
LLMSimu/
├── index.html          # Main HTML structure
├── css/
│   ├── main.css        # Core design system & variables
│   ├── layers.css      # Layer visualization styles
│   ├── network.css     # Network diagram styles
│   └── animations.css  # Keyframe animations
└── js/
    ├── app.js          # Main application controller
    ├── config.js       # Configuration & timing settings
    ├── api.js          # LLM API integration
    ├── tokenizer.js    # Token visualization
    ├── embeddings.js   # Embedding visualization
    ├── attention.js    # Attention heatmap (Canvas)
    ├── ffn.js          # Feed-forward network viz
    ├── output.js       # Output probability display
    └── network.js      # Network diagram (SVG)
```

## 🎨 Design

- **Dark Theme** - Sleek, modern interface with neon accents
- **Glassmorphism** - Frosted glass card effects
- **Smooth Animations** - CSS keyframes and JavaScript-driven motion
- **Responsive** - Works on desktop and tablet devices

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Cyan | `#00f5ff` | Primary accent, active states |
| Magenta | `#ff00ff` | Secondary accent, gradients |
| Green | `#00ff88` | Success states, output |
| Purple | `#8855ff` | Embeddings, special tokens |

## 🔧 Configuration

Edit `js/config.js` to customize:

```javascript
const CONFIG = {
    speedMultiplier: 1,      // Animation speed
    api: {
        baseUrl: 'https://your-api.com/v1',
        model: 'your-model-name'
    }
};
```

## 🌐 API Integration

The simulation uses an OpenAI-compatible API for LLM responses. Configure your API endpoint in `js/api.js`:

```javascript
const API_CONFIG = {
    baseUrl: 'https://your-api-endpoint.com/v1',
    apiKey: 'your-api-key',
    model: 'model-name'
};
```

## 📝 License

MIT License - feel free to use this project for learning and educational purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share your own LLM visualization ideas

---

<p align="center">
  Made with 💜 for AI education
</p>
