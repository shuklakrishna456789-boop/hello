# JARVIS — Personal AI Assistant

A responsive, dark futuristic AI assistant website built with HTML, CSS, JavaScript, Node.js, Express, and the OpenAI API.

## Features

- Chat with JARVIS using the OpenAI Responses API.
- Streaming text responses.
- Browser voice input (Web Speech API; browser support varies).
- Conversation history saved in this browser's local storage.
- AI image generation through the OpenAI Images API.
- PDF text extraction and document analysis (PDFs up to 10 MB).
- Writing mode for articles, emails, assignments, stories, and more.
- Responsive desktop and mobile layout.

## Requirements

- Node.js 20 or newer
- An OpenAI API key with API access and billing/usage enabled
- A modern browser. Voice input generally works best in Chrome over localhost or HTTPS.

## Run locally

1. Open a terminal in the project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env`.
4. Open `.env` and replace `replace_with_your_api_key` with your API key.
5. Start JARVIS:

   ```bash
   npm start
   ```

6. Open http://localhost:3000 in your browser.

For development with automatic server restart:

```bash
npm run dev
```

## Important configuration

- `OPENAI_API_KEY`: Required. Keep this only in the server `.env` file.
- `OPENAI_MODEL`: Defaults to `gpt-5.5`. Change it to a model available to your API account if needed.
- `PORT`: Defaults to `3000`.

The image endpoint uses `gpt-image-2`. If that model is not enabled for your API account, update the model in `server.js` to an image model available to your account.

## Security and privacy notes

- Never publish your `.env` file or expose your API key in frontend JavaScript.
- Chat history is stored in local storage on the current browser and is not synced between devices.
- PDF contents are sent to the configured AI API for analysis. Do not upload confidential or sensitive documents unless you are authorized to share them.
- This starter project has basic request rate limiting and upload-size limits. Before public deployment, add user authentication, per-user quotas, stronger abuse controls, HTTPS, and a persistent database.
- Do not commit `.env` or `node_modules/` to source control.

## Project structure

```text
jarvis-ai-assistant/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

## Troubleshooting

- **Missing API key:** Copy `.env.example` to `.env`, add your key, and restart the server.
- **Model not found / access denied:** Set `OPENAI_MODEL` to a model enabled for your API account.
- **Image generation error:** Confirm image generation is available to your API account; adjust the image model in `server.js` if required.
- **Voice not working:** Allow microphone permission and use a supported browser. Some browsers require HTTPS; localhost is usually treated as a secure context.
- **PDF not readable:** This version extracts selectable text. Scanned/image-only PDFs need OCR, which is not included in this starter build.
