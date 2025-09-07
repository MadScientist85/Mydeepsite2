import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import { createClient } from '@supabase/supabase-js';

// Load environment variables first
dotenv.config();

// Import utilities
import { PROVIDERS } from "./utils/providers.js";
import { TEMPLATES } from "./utils/templates.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PORT = process.env.PORT || 3000;
const DEFAULT_MAX_TOKENS = parseInt(process.env.DEFAULT_MAX_TOKENS) || 8000;
const DEFAULT_TEMPERATURE = parseFloat(process.env.DEFAULT_TEMPERATURE) || 0.7;
const IP_RATE_LIMIT = parseInt(process.env.IP_RATE_LIMIT) || 100; // requests per hour

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS handling for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'dist')
  : path.join(__dirname, 'public');

app.use(express.static(staticPath));

// Supabase setup
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
        supabase = createClient(
            process.env.SUPABASE_URL, 
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        console.log('✅ Supabase client initialized');
    } catch (error) {
        console.error('❌ Supabase initialization failed:', error);
    }
} else {
    console.log('⚠️ Supabase not configured - chat memory disabled');
}

// Rate limiting cache
const ipRequestCache = {};

// Rate limiting middleware
app.use((req, res, next) => {
    if (IP_RATE_LIMIT <= 0) {
        req.rateLimit = { limited: false };
        return next();
    }

    // Skip rate limiting for static files
    if (req.path.match(/\.(js|css|ico|png|jpg|svg|woff|woff2|ttf|eot)$/)) {
        req.rateLimit = { limited: false };
        return next();
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     'unknown';

    const now = Date.now();
    const hourAgo = now - 3600000;

    if (!ipRequestCache[clientIp]) {
        ipRequestCache[clientIp] = [];
    }

    // Clean old requests
    ipRequestCache[clientIp] = ipRequestCache[clientIp].filter(timestamp => timestamp > hourAgo);

    const requestCount = ipRequestCache[clientIp].length;
    const limited = requestCount >= IP_RATE_LIMIT;

    req.rateLimit = {
        limited,
        requestCount,
        remainingRequests: IP_RATE_LIMIT - requestCount,
        clientIp,
        resetTime: limited ? Math.min(...ipRequestCache[clientIp]) + 3600000 : null
    };

    if (limited) {
        const waitTimeMinutes = Math.ceil((req.rateLimit.resetTime - now) / 60000);
        return res.status(429).json({
            ok: false,
            message: `Rate limit exceeded. Try again in ${waitTimeMinutes} minutes.`,
            waitTimeMinutes,
            resetTime: req.rateLimit.resetTime
        });
    }

    ipRequestCache[clientIp].push(now);
    next();
});

// Helper functions
async function saveMessage(messageData) {
    if (!supabase) return;
    try {
        const { error } = await supabase
            .from('chat_messages')
            .insert([messageData]);
        if (error) {
            console.error('Error saving message:', error);
        }
    } catch (e) {
        console.error('Exception saving message:', e);
    }
}

async function getChatHistory(sessionId) {
    if (!supabase) return [];
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(50); // Limit to last 50 messages

        if (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Exception fetching chat history:', e);
        return [];
    }
}

// API Routes

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0"
    });
});

// Environment status endpoint
app.get("/api/check-env", (req, res) => {
    const envStatus = {};
    
    Object.entries(PROVIDERS).forEach(([key, provider]) => {
        envStatus[key] = {
            name: provider.name,
            apiKeyConfigured: !!process.env[provider.apiKeyEnv],
            modelConfigured: !!process.env[provider.modelEnv],
            baseUrl: provider.baseUrl,
            defaultModel: provider.defaultModel,
            model: process.env[provider.modelEnv] || provider.defaultModel
        };
    });

    res.json({
        ok: true,
        env: envStatus,
        supabase: !!supabase,
        rateLimiting: {
            enabled: IP_RATE_LIMIT > 0,
            limit: IP_RATE_LIMIT
        },
        server: {
            status: "running",
            port: PORT,
            nodeEnv: process.env.NODE_ENV || "development"
        },
        timestamp: new Date().toISOString()
    });
});

// Provider connection test
app.post("/api/test-connection", async (req, res) => {
    const { provider, model } = req.body;

    if (!provider || !PROVIDERS[provider]) {
        return res.status(400).json({
            ok: false,
            message: "Invalid or missing provider"
        });
    }

    const providerConfig = PROVIDERS[provider];
    const apiKey = process.env[providerConfig.apiKeyEnv];
    
    if (!apiKey) {
        return res.status(400).json({
            ok: false,
            message: `${providerConfig.name} API key not configured`
        });
    }

    const testModel = model || process.env[providerConfig.modelEnv] || providerConfig.defaultModel;

    try {
        const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                ...(provider === 'openrouter' && { "HTTP-Referer": "https://localhost:3000" })
            },
            body: JSON.stringify({
                model: testModel,
                messages: [{ role: "user", content: "Hello, respond with 'Connection successful'" }],
                max_tokens: 50,
                temperature: 0
            }),
            timeout: 15000
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return res.status(response.status).json({
                ok: false,
                message: errorData.error?.message || `API error: ${response.status} ${response.statusText}`,
                provider: providerConfig.name
            });
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content || 'No response';

        res.json({
            ok: true,
            message: "Connection successful",
            provider: providerConfig.name,
            model: testModel,
            response: responseText
        });

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message || "Connection test failed",
            provider: providerConfig.name
        });
    }
});

// AI chat endpoint with fallback logic
app.post("/api/ask-ai", async (req, res) => {
    const { 
        prompt, 
        provider: requestedProvider, 
        model: requestedModel,
        sessionId, 
        templateId,
        maxTokens,
        temperature 
    } = req.body;

    if (!prompt?.trim()) {
        return res.status(400).json({
            ok: false,
            message: "Missing or empty prompt"
        });
    }

    // Get list of providers to try (requested first, then fallbacks)
    const providersToTry = [];
    
    if (requestedProvider && PROVIDERS[requestedProvider]) {
        providersToTry.push(requestedProvider);
    }
    
    // Add other configured providers as fallbacks
    Object.keys(PROVIDERS).forEach(key => {
        if (key !== requestedProvider && process.env[PROVIDERS[key].apiKeyEnv]) {
            providersToTry.push(key);
        }
    });

    if (providersToTry.length === 0) {
        return res.status(500).json({
            ok: false,
            message: "No AI providers configured with API keys"
        });
    }

    try {
        // Load chat history
        let messages = [];
        if (sessionId && supabase) {
            const history = await getChatHistory(sessionId);
            messages = history.map(msg => ({
                role: msg.role,
                content: msg.content
            }));
        }

        // Add system prompt if template specified
        if (templateId && TEMPLATES[templateId]?.systemPrompt) {
            messages.unshift({
                role: "system",
                content: TEMPLATES[templateId].systemPrompt
            });
        }

        // Add current user message
        messages.push({ role: "user", content: prompt });

        // Save user message to database
        if (sessionId && supabase) {
            await saveMessage({
                session_id: sessionId,
                role: 'user',
                content: prompt,
                timestamp: new Date().toISOString()
            });
        }

        // Try providers in order until one works
        let lastError = null;
        for (const providerKey of providersToTry) {
            const providerConfig = PROVIDERS[providerKey];
            const apiKey = process.env[providerConfig.apiKeyEnv];
            
            if (!apiKey) continue;

            const modelToUse = requestedModel || 
                             process.env[providerConfig.modelEnv] || 
                             providerConfig.defaultModel;

            try {
                console.log(`Trying ${providerConfig.name} with model ${modelToUse}`);

                const response = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                        ...(providerKey === 'openrouter' && { 
                            "HTTP-Referer": process.env.SITE_URL || "https://localhost:3000",
                            "X-Title": "DeepSite 2.0"
                        })
                    },
                    body: JSON.stringify({
                        model: modelToUse,
                        messages: messages,
                        max_tokens: maxTokens || DEFAULT_MAX_TOKENS,
                        temperature: temperature !== undefined ? temperature : DEFAULT_TEMPERATURE,
                        ...(providerKey === 'openrouter' && { top_p: 1, frequency_penalty: 0, presence_penalty: 0 })
                    }),
                    timeout: 60000
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    lastError = `${providerConfig.name}: ${errorData.error?.message || response.statusText}`;
                    console.log(`Failed with ${providerConfig.name}:`, lastError);
                    continue;
                }

                const data = await response.json();
                const aiResponse = data.choices?.[0]?.message?.content;

                if (!aiResponse?.trim()) {
                    lastError = `${providerConfig.name}: Empty response received`;
                    continue;
                }

                // Save AI response to database
                if (sessionId && supabase) {
                    await saveMessage({
                        session_id: sessionId,
                        role: 'assistant',
                        content: aiResponse,
                        timestamp: new Date().toISOString()
                    });
                }

                // Success!
                return res.json({
                    ok: true,
                    response: aiResponse,
                    modelUsed: modelToUse,
                    providerUsed: providerConfig.name,
                    tokensUsed: data.usage?.total_tokens || 0
                });

            } catch (error) {
                lastError = `${providerConfig.name}: ${error.message}`;
                console.log(`Error with ${providerConfig.name}:`, error.message);
                continue;
            }
        }

        // All providers failed
        return res.status(500).json({
            ok: false,
            message: `All AI providers failed. Last error: ${lastError}`,
            providersAttempted: providersToTry.map(key => PROVIDERS[key].name)
        });

    } catch (error) {
        console.error("Error in /api/ask-ai:", error);
        return res.status(500).json({
            ok: false,
            message: error.message || "Internal server error"
        });
    }
});

// Get available templates
app.get("/api/templates", (req, res) => {
    const templates = Object.entries(TEMPLATES).map(([id, template]) => ({
        id,
        name: template.name,
        description: template.description
    }));

    res.json({
        ok: true,
        templates
    });
});

// Get specific template
app.get("/api/templates/:id", (req, res) => {
    const { id } = req.params;
    const template = TEMPLATES[id];

    if (!template) {
        return res.status(404).json({
            ok: false,
            message: "Template not found"
        });
    }

    res.json({
        ok: true,
        template: {
            id,
            name: template.name,
            description: template.description,
            systemPrompt: template.systemPrompt,
            html: template.html
        }
    });
});

// Cleanup old rate limit entries periodically
setInterval(() => {
    const cutoff = Date.now() - 3600000;
    Object.keys(ipRequestCache).forEach(ip => {
        ipRequestCache[ip] = ipRequestCache[ip].filter(timestamp => timestamp > cutoff);
        if (ipRequestCache[ip].length === 0) {
            delete ipRequestCache[ip];
        }
    });
}, 300000); // Every 5 minutes

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        ok: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
    });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 DeepSite 2.0 server running on port ${PORT}`);
    console.log(`📁 Serving static files from: ${staticPath}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`⚙️ Environment check: http://localhost:${PORT}/api/check-env`);
    console.log(`🌍 Node environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

export default app;
