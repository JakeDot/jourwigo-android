# API Keys Configuration Guide

This guide explains how to configure API keys for the Jourwigo Android application.

## Overview

The app supports two AI providers:
- **Gemini** (Google): Required for core AI features
- **Claude** (Anthropic): Optional for Claude AI integration

## Quick Setup

1. Create a `.env.local` file in the project root (this file is gitignored)
2. Add your API keys to `.env.local`:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
CLAUDE_API_KEY="your-claude-api-key-here"
```

3. Run `npm run dev` to start the app with your keys

## Getting Your API Keys

### Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (format: `AIza...`)

### Claude API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (format: `sk-ant-...`)

## Environment Files

### `.env.example`
Template file with placeholder values. This file is tracked in git and shows which environment variables are needed.

### `.env.local`
Your actual configuration file with real API keys. This file is **gitignored** and should never be committed.

### `.env` (not recommended)
Generic environment file. Use `.env.local` instead to ensure it's gitignored.

## Security Best Practices

✅ **DO:**
- Store API keys in `.env.local`
- Keep your API keys private
- Rotate keys if they're exposed
- Use the placeholder values from `.env.example` as reference

❌ **DON'T:**
- Hardcode API keys in source code
- Commit `.env.local` to git
- Share your API keys publicly
- Use real keys in `.env.example`

## How It Works

The build process (`vite.config.ts`) reads environment variables from `.env.local` and injects them into your app at build time using Vite's `define` feature:

```typescript
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.CLAUDE_API_KEY': JSON.stringify(env.CLAUDE_API_KEY),
}
```

Your app code can then access these values via:
```typescript
const apiKey = process.env.GEMINI_API_KEY;
```

## Troubleshooting

### "API key not found" error
- Ensure `.env.local` exists in the project root
- Check that the key names match exactly: `GEMINI_API_KEY` and `CLAUDE_API_KEY`
- Restart the dev server after adding/changing keys

### Keys not working
- Verify you copied the complete key (no truncation)
- Check for extra spaces or quotes in the `.env.local` file
- Ensure your API key is valid and active in the provider's console

### Building for production
For production builds, set environment variables through your hosting platform's environment configuration (e.g., Cloud Run, Vercel, etc.) instead of using `.env.local`.

## CI/CD Integration

For GitHub Actions and automated builds, configure secrets:

1. Go to your repository's Settings → Secrets and variables → Actions
2. Add secrets:
   - `GEMINI_API_KEY`
   - `CLAUDE_API_KEY` (if using Claude)

Access in workflows:
```yaml
env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
```

## Support

For issues related to:
- **Gemini API**: [Google AI Studio Support](https://aistudio.google.com/)
- **Claude API**: [Anthropic Support](https://support.anthropic.com/)
- **This app**: Open an issue in the repository
