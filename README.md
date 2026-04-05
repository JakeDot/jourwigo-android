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
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Configure API keys (Gemini and Claude)

- API keys are not bundled with the repo. You must supply your own credentials.
- Local development: copy `.env.example` to `.env.local` and set `GEMINI_API_KEY=<your key>`. If you are self-hosting, also set `APP_URL` to the public URL you expose.
- AI Studio deployment: open your app in AI Studio → **Secrets** and add `GEMINI_API_KEY`; AI Studio injects it at runtime. `APP_URL` is filled automatically when AI Studio deploys the app.
- Claude keys are only used by the GitHub automation workflows. If you want those to run, add a repository secret `ANTHROPIC_API_KEY` with your Claude key. No Claude key is required to run the app itself.
