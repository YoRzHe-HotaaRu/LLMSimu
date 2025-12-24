/**
 * ZenMux API Client
 * Handles communication with the ZenMux API for LLM responses
 */
const ZenMuxAPI = {
    /**
     * Send a chat completion request with streaming
     * @param {string} prompt - User prompt
     * @param {function} onToken - Callback for each token received
     * @param {function} onComplete - Callback when complete
     * @param {function} onError - Callback on error
     */
    async streamCompletion(prompt, onToken, onComplete, onError) {
        const url = `${CONFIG.api.baseUrl}/chat/completions`;

        const body = {
            model: CONFIG.api.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful, concise assistant. Keep responses brief and informative.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: CONFIG.api.maxTokens,
            temperature: CONFIG.api.temperature,
            stream: true
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.api.apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });

                // Process complete SSE messages
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            onComplete();
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices?.[0]?.delta;

                            if (delta?.content) {
                                onToken(delta.content);
                            }
                        } catch (e) {
                            // Skip invalid JSON (partial messages)
                        }
                    }
                }
            }

            onComplete();

        } catch (error) {
            console.error('ZenMux API Error:', error);
            onError(error);
        }
    },

    /**
     * Non-streaming completion (fallback)
     * @param {string} prompt - User prompt
     * @returns {Promise<string>} Full response text
     */
    async getCompletion(prompt) {
        const url = `${CONFIG.api.baseUrl}/chat/completions`;

        const body = {
            model: CONFIG.api.model,
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful, concise assistant.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: CONFIG.api.maxTokens,
            temperature: CONFIG.api.temperature,
            stream: false
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.api.apiKey}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    },

    /**
     * Test API connection
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            const response = await fetch(`${CONFIG.api.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${CONFIG.api.apiKey}`
                }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
};
