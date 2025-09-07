# DeepSite 2.0

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMadScientist85%2FMydeepsite2.0&env=OPENAI_API_KEY,OPENROUTER_API_KEY,XAI_API_KEY,GROQ_API_KEY,PERPLEXITY_API_KEY,SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY&envDescription=AI%20Provider%20API%20Keys%20and%20Database%20Configuration&envLink=https%3A%2F%2Fgithub.com%2FMadScientist85%2FMydeepsite2.0%23environment-variables&project-name=deepsite-2-0&repository-name=deepsite-2-0)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-blue?style=for-the-badge&logo=vercel)](https://deepsite-2-0.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/MadScientist85/Mydeepsite2.0)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

AI-powered website generator with multi-provider support, featuring OpenAI, OpenRouter, XAI (Grok), Groq, Perplexity, and more.

## Quick Links

- **🚀 [One-Click Deploy](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMadScientist85%2FMydeepsite2.0)**
- **📖 [Live Demo](https://deepsite-2-0.vercel.app)** 
- **🔧 [API Documentation](https://deepsite-2-0.vercel.app/api/check-env)**
- **💬 [GitHub Discussions](https://github.com/MadScientist85/Mydeepsite2.0/discussions)**
- **🐛 [Report Issues](https://github.com/MadScientist85/Mydeepsite2.0/issues)**

## Status

![Vercel](https://img.shields.io/github/deployments/MadScientist85/Mydeepsite2.0/production?label=Vercel&logo=vercel)
![GitHub last commit](https://img.shields.io/github/last-commit/MadScientist85/Mydeepsite2.0)
![GitHub issues](https://img.shields.io/github/issues/MadScientist85/Mydeepsite2.0)
![GitHub stars](https://img.shields.io/github/stars/MadScientist85/Mydeepsite2.0?style=social)

- **Multi-Provider AI Support**: OpenAI, OpenRouter, XAI (Grok), Groq, Perplexity, Anthropic, Cohere
- **Intelligent Fallback**: Automatically tries alternative providers if one fails
- **Chat Memory**: Persistent conversations using Supabase
- **Real-time Generation**: Live HTML preview as AI generates content
- **Template System**: Pre-built templates for different website types
- **Rate Limiting**: IP-based request limiting for production use
- **Modern Stack**: React, TypeScript, Express.js, Supabase

## Quick Start

### Option 1: Google Colab (Recommended for Testing)

1. **Add API Keys to Colab Secrets**:
   - Go to the secrets tab in Google Colab
   - Add your API keys with these exact names:
     - `OPENAI_API_KEY`
     - `OPENROUTER_API_KEY`
     - `XAI_API_KEY`
     - `GROQ_API_KEY`
     - `PERPLEXITY_API_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `VERCEL_TOKEN` (for deployment)
     - `GITHUB_TOKEN` (for repository access)
     - `NGROK_AUTH_TOKEN` (for tunneling)

2. **Run the Complete Deployment Script**:
   ```python
   # Copy and paste the complete deployment script into a Colab cell
   deployment = DeepSiteDeployment()
   deployment.run_full_deployment()
   ```

### Option 2: Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MadScientist85/Mydeepsite2.0.git
   cd Mydeepsite2.0
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.template .env
   # Edit .env with your API keys
   ```

4. **Start the server**:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

### Option 3: One-Click Vercel Deployment

Click the deploy button above to automatically:
- Clone the repository to your GitHub account
- Create a new Vercel project
- Set up environment variable prompts
- Deploy to production

**After clicking deploy, you'll need to:**
1. Add your API keys in the Vercel dashboard
2. Redeploy to activate the configuration

### Option 4: Manual Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel dashboard**:
   - Go to your project settings in Vercel
   - Navigate to Environment Variables
   - Add all the required variables from the `.env.template`
   - **Important**: Set these for Production, Preview, and Development environments

5. **Redeploy after adding environment variables**:
   ```bash
   vercel --prod
   ```

## Environment Setup for Vercel

When deploying to Vercel, add these environment variables in your project dashboard:

### Required Variables
```
OPENAI_API_KEY
OPENROUTER_API_KEY  
XAI_API_KEY
GROQ_API_KEY
PERPLEXITY_API_KEY
```

### Optional but Recommended
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
DEFAULT_MAX_TOKENS=8000
DEFAULT_TEMPERATURE=0.7
IP_RATE_LIMIT=100
```

### Auto-Deploy Configuration
The repository includes:
- `vercel.json` - Vercel deployment configuration
- GitHub Actions integration (optional)
- Automatic deployments on push to main branch

## Environment Variables

### Required API Keys (at least one)

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o

# OpenRouter (Access to multiple models)
OPENROUTER_API_KEY=your_openrouter_api_key_here  
OPENROUTER_MODEL=deepseek/deepseek-chat-v3.1

# XAI (Grok)
XAI_API_KEY=your_xai_api_key_here
XAI_MODEL=grok-4

# Groq (Ultra-fast inference)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# Perplexity (Web-connected AI)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PERPLEXITY_MODEL=llama-3.1-sonar-large-128k-online
```

### Optional Database (for chat memory)

```env
# Supabase
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Server Configuration

```env
PORT=3000
DEFAULT_MAX_TOKENS=8000
DEFAULT_TEMPERATURE=0.7
IP_RATE_LIMIT=100
NODE_ENV=development
```

## Getting API Keys

### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add billing information if required

### OpenRouter
1. Go to [OpenRouter Keys](https://openrouter.ai/keys)
2. Create an account and generate an API key
3. Add credits to your account

### XAI (Grok)
1. Go to [XAI Console](https://console.x.ai/)
2. Create an account and generate an API key
3. Note: Grok-4 may require special access

### Groq
1. Go to [Groq Console](https://console.groq.com/)
2. Create an account and generate an API key
3. Free tier available with rate limits

### Perplexity
1. Go to [Perplexity API](https://docs.perplexity.ai/docs/getting-started)
2. Create an account and generate an API key
3. Pay-per-use pricing

### Supabase (Optional)
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > API to get your URL and service role key
4. Run the SQL schema provided in the deployment script

## Available Models

### OpenRouter Models
- `qwen/qwen3-235b-a22b-thinking-2507`
- `deepseek/deepseek-chat-v3.1`
- `openai/gpt-oss-120b`
- `x-ai/grok-code-fast-1`
- `mistralai/codestral-2508`

### XAI Models
- `grok-4`
- `grok-beta`
- `grok-vision-beta`

### Groq Models
- `llama-3.3-70b-versatile`
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `mixtral-8x7b-32768`

## API Endpoints

### Health Check
```
GET /api/health
```

### Environment Status
```
GET /api/check-env
```

### Test Provider Connection
```
POST /api/test-connection
{
  "provider": "openai"
}
```

### AI Chat
```
POST /api/ask-ai
{
  "prompt": "Create a simple landing page",
  "provider": "openai",
  "sessionId": "uuid-string",
  "templateId": "landing-page",
  "maxTokens": 4000,
  "temperature": 0.7
}
```

## Database Schema

If using Supabase for chat memory, run this SQL:

```sql
-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY IF NOT EXISTS "Allow all operations on chat_messages" 
ON chat_messages FOR ALL 
USING (true);
```

## Testing

### Quick Test
```python
# Use the quick test script
python quick_test.py
```

### Manual Testing
1. Start your server
2. Visit `/api/health` for basic health check
3. Visit `/api/check-env` for environment status
4. Use the frontend to test AI generation

## Troubleshooting

### Common Issues

1. **"No AI providers configured"**
   - Check that at least one API key is set correctly
   - Verify the API key is valid and has credits

2. **"Connection test failed"**
   - Check your internet connection
   - Verify API keys are correct
   - Check if the provider's service is down

3. **"Chat memory not working"**
   - Verify Supabase URL and key are set
   - Check that the database schema is created
   - Ensure RLS policies are configured

4. **Rate limiting issues**
   - Adjust `IP_RATE_LIMIT` in environment variables
   - Consider upgrading your API plan

### Development

For local development with hot reloading:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Start tunnel (optional)
npx localtunnel --port 3000

# Terminal 3: Run tests
python quick_test.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/MadScientist85/Mydeepsite2.0/issues)
- Documentation: Check this README and code comments
- Community: Join discussions in GitHub Discussions

## Roadmap

- [ ] Additional AI provider integrations
- [ ] Enhanced template system
- [ ] Real-time collaboration features
- [ ] Advanced customization options
- [ ] Mobile app companion
- [ ] Plugin system for extensions
