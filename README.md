# DocsenseAI

AI-powered documentation assistant for developers.

Docsense AI helps you understand technical documentation faster by providing contextual explanations, section summaries, code explanations, and page-aware AI search directly inside documentation websites.

## Features

* Explain documentation sections with one click
* Explain selected text
* Ask questions about the current documentation page
* Jump directly to relevant sections
* Context-aware responses based on page content
* Markdown-rendered AI responses
* Works across popular documentation websites

## Supported Sites

* MDN Web Docs
* Node.js Documentation
* npm Documentation
* Express Documentation
* Discord.js Documentation
* Other documentation websites

## Setup

### 1. Get a Gemini API Key

Visit:

https://aistudio.google.com/app/apikey

Generate a free Gemini API key.

### 2. Load Extension

1. Open Chrome
2. Navigate to `chrome://extensions`
3. Enable Developer Mode
4. Click **Load Unpacked**
5. Select the extension folder

### 3. Configure Docsense

1. Open the Docsense popup
2. Paste your Gemini API key
3. Click **Save Gemini API Key** Visit: https://aistudio.google.com/app/apikey
4. Click **Activate Docsense**

## How To Use

### Search Assistant

Click the floating Docsense button and ask questions about the current page.

### Explain Section

Click the Docsense icon beside a heading to get an explanation.

### Explain Selection

Enable selection mode and highlight any text to get an explanation.

## Tech Stack

* JavaScript
* Chrome Extension Manifest V3
* Gemini API
* Marked.js
* KaTeX


## IMPORTANT

Docsense AI does not provide an API key.
Users must use their own Gemini API key obtained from Google AI Studio.


## Roadmap

* Better section matching
* Multi-model support
* Improved search ranking
* Support for more documentation websites

## License

Copyright © 2026 Sunny Kumar. All Rights Reserved.

The source code of DocSenseAI is publicly available for viewing and reference purposes only. Copying, modifying, redistributing, or using substantial portions of the source code in other projects is not permitted without explicit written permission.

See the [LICENSE](LICENSE) file for the full license terms.
