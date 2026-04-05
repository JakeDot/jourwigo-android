<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/99a041b9-f228-49fb-ac3b-2470eb4dd376

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure your API keys in [.env.local](.env.local):
   - **GEMINI_API_KEY**: Required for Gemini AI features
     - Get your key from [Google AI Studio](https://aistudio.google.com/apikey)
   - **CLAUDE_API_KEY**: Optional for Claude/Anthropic AI integration
     - Get your key from [Anthropic Console](https://console.anthropic.com/)

   Example `.env.local` file:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   CLAUDE_API_KEY="your-claude-api-key-here"
   ```
3. Run the app:
   `npm run dev`
