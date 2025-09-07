export const PROVIDERS = {
    openai: {
        name: "OpenAI",
        apiKeyEnv: "OPENAI_API_KEY",
        modelEnv: "OPENAI_MODEL",
        baseUrl: "https://api.openai.com/v1",
        defaultModel: "gpt-4o",
        models: [
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo"
        ],
        maxTokens: 128000,
        supportsStreaming: true,
        description: "OpenAI's GPT models"
    },

    openrouter: {
        name: "OpenRouter",
        apiKeyEnv: "OPENROUTER_API_KEY",
        modelEnv: "OPENROUTER_MODEL",
        baseUrl: "https://openrouter.ai/api/v1",
        defaultModel: "deepseek/deepseek-chat-v3.1",
        models: [
            "qwen/qwen3-235b-a22b-thinking-2507",
            "deepseek/deepseek-chat-v3.1",
            "openai/gpt-oss-120b",
            "x-ai/grok-code-fast-1",
            "mistralai/codestral-2508",
            "anthropic/claude-3-5-haiku",
            "anthropic/claude-3-5-sonnet",
            "meta-llama/llama-3.3-70b-instruct",
            "google/gemini-2.0-flash-exp",
            "nvidia/llama-3.1-nemotron-70b-instruct"
        ],
        maxTokens: 200000,
        supportsStreaming: true,
        description: "Access multiple AI models through OpenRouter",
        modelDisplayNames: {
            "qwen/qwen3-235b-a22b-thinking-2507": "Qwen 3 235B Thinking",
            "deepseek/deepseek-chat-v3.1": "DeepSeek Chat V3.1",
            "openai/gpt-oss-120b": "GPT OSS 120B",
            "x-ai/grok-code-fast-1": "Grok Code Fast",
            "mistralai/codestral-2508": "Codestral 25.08"
        }
    },

    xai: {
        name: "XAI (Grok)",
        apiKeyEnv: "XAI_API_KEY",
        modelEnv: "XAI_MODEL",
        baseUrl: "https://api.x.ai/v1",
        defaultModel: "grok-4",
        models: [
            "grok-4",
            "grok-beta",
            "grok-vision-beta"
        ],
        maxTokens: 131072,
        supportsStreaming: true,
        description: "XAI's Grok models with real-time information access"
    },

    groq: {
        name: "Groq",
        apiKeyEnv: "GROQ_API_KEY",
        modelEnv: "GROQ_MODEL",
        baseUrl: "https://api.groq.com/openai/v1",
        defaultModel: "llama-3.3-70b-versatile",
        models: [
            "llama-3.3-70b-versatile",
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
            "llama-3.2-90b-vision-preview",
            "llama-3.2-11b-vision-preview"
        ],
        maxTokens: 32768,
        supportsStreaming: true,
        description: "Ultra-fast AI inference with Groq's hardware"
    },

    perplexity: {
        name: "Perplexity",
        apiKeyEnv: "PERPLEXITY_API_KEY",
        modelEnv: "PERPLEXITY_MODEL",
        baseUrl: "https://api.perplexity.ai",
        defaultModel: "llama-3.1-sonar-large-128k-online",
        models: [
            "llama-3.1-sonar-large-128k-online",
            "llama-3.1-sonar-small-128k-online",
            "llama-3.1-sonar-large-128k-chat",
            "llama-3.1-sonar-small-128k-chat",
            "llama-3.1-8b-instruct",
            "llama-3.1-70b-instruct"
        ],
        maxTokens: 131072,
        supportsStreaming: true,
        description: "AI with real-time web search capabilities"
    } // <-- This brace was missing!
};

// Helper function to get model display name
export const getModelDisplayName = (providerId, modelId) => {
    const provider = PROVIDERS[providerId];
    if (!provider) return modelId;
    
    if (provider.modelDisplayNames && provider.modelDisplayNames[modelId]) {
        return provider.modelDisplayNames[modelId];
    }
    
    // Clean up common model ID patterns
    return modelId
        .replace(/^[^/]+\//, '') // Remove provider prefix
        .replace(/:free$/, '') // Remove :free suffix
        .replace(/-\d{8}$/, '') // Remove date suffix
        .replace(/-\d{4}-\d{2}-\d{2}$/, '') // Remove ISO date suffix
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// Helper function to get all available models across providers
export const getAllAvailableModels = () => {
    const allModels = [];
    
    Object.entries(PROVIDERS).forEach(([providerId, provider]) => {
        provider.models.forEach(modelId => {
            allModels.push({
                providerId,
                providerName: provider.name,
                modelId,
                displayName: getModelDisplayName(providerId, modelId),
                maxTokens: provider.maxTokens,
                supportsStreaming: provider.supportsStreaming
            });
        });
    });
    
    return allModels;
};

// Helper function to get configured providers
export const getConfiguredProviders = () => {
    return Object.entries(PROVIDERS)
        .filter(([, provider]) => {
            const apiKey = process.env?.[provider.apiKeyEnv];
            return apiKey && apiKey.length > 0;
        })
        .map(([id, provider]) => ({
            id,
            name: provider.name,
            description: provider.description,
            models: provider.models,
            defaultModel: provider.defaultModel
        }));
};

// Helper function to validate provider configuration
export const validateProviderConfig = (providerId, modelId) => {
    const provider = PROVIDERS[providerId];
    if (!provider) {
        return { valid: false, error: `Unknown provider: ${providerId}` };
    }
    
    const apiKey = process.env?.[provider.apiKeyEnv];
    if (!apiKey) {
        return { valid: false, error: `API key not configured for ${provider.name}` };
    }
    
    if (modelId && !provider.models.includes(modelId)) {
        return { valid: false, error: `Model ${modelId} not available for ${provider.name}` };
    }
    
    return { valid: true };
};

export default PROVIDERS;
