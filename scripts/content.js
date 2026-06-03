console.log('CONTENT JS RUNNING');
console.log('MARKED:', marked);

let selectionMode = false;
let selectedText = '';

if (window.docsenseInjected) {
    console.log('Docsense already active');
} else {
    window.docsenseInjected = true;
    initializeDocsense();
}

function getArticleRoot() {

    const possibleRoots = [

        'article',

        'main',

        '[role="main"]',

        '.main-content',

        '.main-page-content',

        '.content',

        '.documentation',

        '.markdown-body',

        '.theme-doc-markdown',

        '.theme-doc-content',

        '#content',

        '#main-content'

    ];

    for (const selector of possibleRoots) {

        const element = document.querySelector(selector);

        if (element) {

            console.log('Using root:', selector);

            return element;

        }

    }

    console.log('Falling back to document.body');

    return document.body;

}

function extractSections(root) {

    const sections = [];

    const headings =
        root.querySelectorAll(
            'h1, h2, h3, h4, h5, h6'
        );

    headings.forEach((heading, index) => {

        const sectionContent = [];

        let currentElement =
            heading.parentElement?.nextElementSibling ||
            heading.nextElementSibling;

        while (currentElement) {

            const tag =
                currentElement.tagName;

            if (
                ['H1', 'H2', 'H3', 'H4', 'H5', 'H6']
                    .includes(tag)
            ) {
                break;
            }

            const nestedHeading =
                currentElement.querySelector(
                    'h1, h2, h3, h4, h5, h6'
                );

            if (nestedHeading) {
                break;
            }

            const text =
                currentElement.innerText.trim();

            if (text) {
                sectionContent.push(text);
            }

            currentElement =
                currentElement.nextElementSibling;

        }

        sections.push({

            id:
                heading.id ||
                heading.textContent
                    .toLowerCase()
                    .replace(/\s+/g, '-'),

            heading:
                heading.textContent.trim(),

            level:
                heading.tagName,

            content:
                sectionContent,

            element:
                heading

        });

    });

    return sections;

}

function extractCodeBlocks(root) {

    const codeBlocks = [];

    const seen = new Set();



    // =========================
    // MDN SHADOW DOM BLOCKS
    // =========================

    const mdnExamples =
        document.querySelectorAll(
            'mdn-code-example'
        );



    mdnExamples.forEach((example, index) => {

        let text = '';



        // access shadow DOM
        if (example.shadowRoot) {

            const shadowElement =

                example.shadowRoot.querySelector(
                    '*'
                );



            if (shadowElement) {

                text =
                    shadowElement.innerText.trim();

            }

        }



        if (!text) return;



        if (seen.has(text)) return;

        seen.add(text);



        const lineCount =
            text.split('\n').length;



        const charCount =
            text.length;



        const isLargeEnough =

            lineCount >= 2 ||

            charCount >= 80;



        if (!isLargeEnough) {

            return;

        }



        codeBlocks.push({

            id: `mdn-${index}`,

            text: text,

            lineCount: lineCount,

            charCount: charCount,

            element: example

        });

    });



    // =========================
    // NORMAL PRE BLOCKS
    // =========================

    const preBlocks =
        document.querySelectorAll('pre');



    preBlocks.forEach((pre, index) => {

        const text =
            pre.innerText.trim();



        if (!text) return;



        if (seen.has(text)) return;

        seen.add(text);



        const lineCount =
            text.split('\n').length;



        const charCount =
            text.length;



        const isLargeEnough =

            lineCount >= 2 ||

            charCount >= 80;



        if (!isLargeEnough) {

            return;

        }



        codeBlocks.push({

            id: `pre-${index}`,

            text: text,

            lineCount: lineCount,

            charCount: charCount,

            element: pre

        });

    });

    return codeBlocks;

}

function extractPageData() {

    const root = getArticleRoot();



    if (!root) {

        console.log('No root found');

        return null;

    }



    return {

        url: window.location.href,

        title: document.title,

        sections: extractSections(root),

        codeBlocks: extractCodeBlocks(root)

    };

}

function styleInjectedButton(button) {

    button.src = chrome.runtime.getURL('images/logo.png');

    button.alt = 'Docsense AI';

    button.style.width = '36px';
    button.style.height = '36px';

    button.style.minWidth = '36px';
    button.style.minHeight = '36px';

    button.style.display = 'inline-block';

    button.style.objectFit = 'contain';

    button.style.marginLeft = '8px';

    button.style.verticalAlign = 'middle';

    button.style.cursor = 'pointer';

    button.style.opacity = '0.88';

    button.style.transition = '0.2s ease';

    button.style.position = 'relative';

    button.style.top = '-1px';

    button.style.flexShrink = '0';

    button.style.zIndex = '9999';

    button.style.background =
        'transparent';

    button.style.border =
        'none';

    button.style.borderRadius =
        '0';

    button.style.margin =
        '0';

    button.style.display =
        'inline-block';

    button.addEventListener('mouseenter', () => {

        button.style.transform = 'scale(1.12)';
        button.style.opacity = '1';

    });

    button.addEventListener('mouseleave', () => {

        button.style.transform = 'scale(1)';
        button.style.opacity = '0.88';

    });

}


function removeExistingPopup() {

    const existingPopup = document.querySelector('.docsense-popup');

    if (existingPopup) {
        existingPopup.remove();
    }

}



function createAssistantPopup(x, y, headingText) {

    removeExistingPopup();

    const popup =
        document.createElement('div');

    popup.classList.add(
        'docsense-popup'
    );

    const popupWidth = 420;

    let left =
        x + window.scrollX;

    if (
        left + popupWidth >
        window.innerWidth
    ) {
        left =
            window.innerWidth -
            popupWidth -
            20;
    }

    popup.style.position = 'absolute';

    popup.style.top =
        `${y + window.scrollY}px`;

    popup.style.left =
        `${left}px`;

    popup.style.width = '420px';

    popup.style.maxWidth = '90vw';

    popup.style.maxHeight = '420px';

    popup.style.overflowY = 'auto';

    popup.style.padding = '16px';

    popup.style.borderRadius = '16px';

    popup.style.background =
        'rgba(20,20,20,0.92)';

    popup.style.backdropFilter =
        'blur(12px)';

    popup.style.color = 'white';

    popup.style.fontSize = '14px';

    popup.style.lineHeight = '1.6';

    popup.style.zIndex = '999999';

    popup.style.boxShadow =
        '0 8px 24px rgba(0,0,0,0.35)';

    popup.style.border =
        '1px solid rgba(255,255,255,0.08)';

    popup.style.fontFamily =
        'sans-serif';

    popup.innerHTML = `
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:12px;
        ">

            <div style="
                font-weight:700;
                font-size:18px;
            ">
                Docsense AI
            </div>

            <div class="docsense-close-btn" style="
                cursor:pointer;
                opacity:0.7;
                font-size:20px;
            ">
                ×
            </div>

        </div>

        <div style="
            font-size:16px;
            font-weight:600;
            margin-bottom:10px;
        ">
            ${headingText}
        </div>

        <div
            class="docsense-response"
            style="
                opacity:0.9;
                margin-bottom:16px;
                max-height:240px;
                overflow-y:auto;
                padding-right:4px;
            "
        >
            Thinking...
        </div>

        <button class="docsense-expand-btn" style="
            width:100%;
            padding:12px;
            border:none;
            border-radius:12px;
            cursor:pointer;
            background:#8b5cf6;
            color:white;
            font-weight:600;
            font-size:14px;
        ">
            Expand
        </button>
    `;

    popup
        .querySelector(
            '.docsense-close-btn'
        )
        .addEventListener(
            'click',
            () => {
                popup.remove();
            }
        );

    popup
        .querySelector(
            '.docsense-expand-btn'
        )
        .addEventListener(
            'click',
            () => {
                popup.style.height = '75vh';

                popup.style.width = '620px';

                popup.style.maxWidth = '95vw';

                popup.style.maxHeight = '80vh';

                popup
                    .querySelector(
                        '.docsense-response'
                    )
                    .style.maxHeight = '60vh';

                const currentLeft =
                    parseInt(popup.style.left);

                if (
                    currentLeft + 620 >
                    window.innerWidth
                ) {
                    popup.style.left =
                        `${window.innerWidth - 640}px`;
                }

            }
        );

    document.body.appendChild(popup);

    let isDragging = false;

    let offsetX = 0;

    let offsetY = 0;

    popup.addEventListener(
        'mousedown',
        (event) => {

            if (
                event.target.closest(
                    '.docsense-response'
                )
            ) {
                return;
            }

            isDragging = true;

            offsetX =
                event.clientX -
                popup.offsetLeft;

            offsetY =
                event.clientY -
                popup.offsetTop;

        }
    );

    document.addEventListener(
        'mousemove',
        (event) => {

            if (!isDragging) {
                return;
            }

            popup.style.left =
                `${event.clientX - offsetX}px`;

            popup.style.top =
                `${event.clientY - offsetY}px`;

            popup.style.right =
                'auto';

        }
    );

    document.addEventListener(
        'mouseup',
        () => {

            isDragging = false;

        }
    );

}

function openSearchAssistant() {

    removeExistingPopup();

    const popup =
        document.createElement('div');

    popup.className =
        'docsense-popup';

    popup.style.position =
        'fixed';

    popup.style.top = '70px';

    popup.style.right = '20px';

    popup.style.width = '420px';

    popup.style.maxWidth = '90vw';

    popup.style.background =
        'rgba(20,20,20,0.96)';

    popup.style.border =
        '1px solid rgba(255,255,255,0.08)';

    popup.style.borderRadius =
        '18px';

    popup.style.padding =
        '16px';

    popup.style.zIndex =
        '999999';

    popup.style.color =
        'white';

    popup.style.fontFamily =
        'sans-serif';

    popup.style.boxShadow =
        '0 8px 24px rgba(0,0,0,0.35)';

    popup.innerHTML = `
        <div style="
            font-size:18px;
            font-weight:700;
            margin-bottom:14px;
        ">
            Docsense AI
        </div>

        <textarea
            class="docsense-search-input"
            placeholder="Ask about this documentation..."
            style="
                width:100%;
                height:90px;
                resize:none;
                border:none;
                outline:none;
                border-radius:12px;
                padding:12px;
                background:#111;
                color:white;
                font-size:14px;
                margin-bottom:12px;
                box-sizing:border-box;
            "
        ></textarea>

        <button
            class="docsense-search-btn"
            style="
                width:100%;
                padding:12px;
                border:none;
                border-radius:12px;
                background:#8b5cf6;
                color:white;
                font-weight:600;
                cursor:pointer;
            "
        >
            Ask
        </button>

        <div
            class="docsense-search-response"
            style="
                margin-top:16px;
                max-height:300px;
                overflow-y:auto;
                line-height:1.6;
                opacity:0.9;
            "
        ></div>
    `;

    popup
        .querySelector(
            '.docsense-search-btn'
        )
        .addEventListener(
            'click',
            async () => {

                const input =
                    popup.querySelector(
                        '.docsense-search-input'
                    );

                const responseElement =
                    popup.querySelector(
                        '.docsense-search-response'
                    );

                const userQuery =
                    input.value.trim();

                if (!userQuery) {
                    return;
                }

                responseElement.innerHTML =
                    'Thinking...';

                const aiResponse =
                    await askSearchAI(
                        userQuery
                    );

                responseElement.innerHTML =
                    formatSearchResponse(
                        aiResponse
                    );

            }
        );



    document.body.appendChild(popup);

}

function buildDocumentationPrompt(title, content) {

    return `
You are Docsense AI, an expert documentation assistant.

Current Page URL:
${window.location.href}

Section Title:
${title}

Documentation:
${content}

Response Format:

Give a very short overview in 1-2 sentences describing what this section is about.

Full Explanation

Requirements:
- Explain in beginner-friendly language.
- Focus on understanding rather than summarizing.
- Keep the explanation concise.
- Use headings and bullet points where useful.
- Explain only the most important concepts.
- Avoid long paragraphs.
- Avoid giant walls of text.
- Avoid unnecessary theory.
- Do not repeat information.
- Optimize for quick reading inside a popup.
- The entire response should usually fit within 200-300 words.
`;

}

function buildCodePrompt(code) {

    return `
You are Docsense AI, an expert programming mentor.

Current Page URL:
${window.location.href}

Code:
${code}

Response Format:

Start with a very short explanation in 1-2 sentences describing what the code does.

Then provide:

## Full Explanation

Requirements:
- Break the code into logical parts.
- Give each part a short title.
- Explain what each part does.
- Explain why each part exists.
- Follow the execution flow of the code.
- Group related lines together.
- Explain important concepts only when they become relevant.
- Do NOT explain every line individually.
- Do NOT explain obvious statements unless they are important.
- Do NOT write a theory-heavy essay.
- Focus on helping the reader understand the actual code.

Readability Requirements:
- Use markdown headings.
- Use bold text for important concepts.
- Use bullet points.
- Keep bullet points short.
- Keep paragraphs short.
- Avoid large walls of text.
- Prioritize readability over completeness.
- Explain the most important ideas first.
- Avoid more than 5 bullet points in a section.

The full explanation should usually fit within 250-350 words.
`;

}

function buildSelectionPrompt(text) {

    return `
You are Docsense AI, an expert documentation assistant.

Current Page URL:
${window.location.href}

Selected Content:
${text}

Response Format:

Start with a short 1-2 sentence overview describing what the selected content is about.

Then provide:

## Full Explanation

Requirements:
- Explain in the clearest possible way.
- Assume the reader is learning.
- Use markdown headings and bullet points.
- Make the response highly readable.
- Expand technical concepts when needed.
- Use examples when useful.
- Avoid giant walls of text.
- Keep explanations concise.
- Optimize for quick reading inside a popup.
`;

}

async function askAI(prompt) {

    return new Promise((resolve) => {

        chrome.storage.local.get(
            ['geminiApiKey'],
            (result) => {

                const apiKey = result.geminiApiKey;

                if (!apiKey) {
                    resolve('No Gemini API key found.');
                    return;
                }



                chrome.runtime.sendMessage(
                    {
                        type: 'ASK_GEMINI',
                        prompt,
                        apiKey
                    },

                    (response) => {

                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            resolve('Failed to contact background service worker.');
                            return;
                        }

                        try {

                            console.log(response);

                            if (response?.error) {
                                resolve(
                                    response.error.message ||
                                    'Unknown AI error'
                                );
                                return;
                            }

                            const text =
                                response?.candidates?.[0]
                                    ?.content?.parts
                                    ?.map(part => part.text)
                                    ?.join('\n');

                            resolve(text || 'No AI response');

                        } catch (error) {

                            console.error(error);
                            resolve('AI response parsing failed');

                        }

                    }
                );

            }
        );

    });

}

async function askSearchAI(userQuery) {

    const data =
        window.docsenseData;

    if (!data) {
        return 'No page data found.';
    }

    const relevantSections =
        data.sections
            .filter((section) => {

                const combined =
                    (
                        section.heading +
                        ' ' +
                        section.content.join(' ')
                    ).toLowerCase();

                const queryWords =
                    userQuery
                        .toLowerCase()
                        .split(/\s+/)
                        .filter(
                            word =>
                                word.length > 2
                        );
                return queryWords.some(
                    word =>
                        combined.includes(word)
                );

            })
            .slice(0, 5);
    if (relevantSections.length === 0) {

        return 'I could not find a relevant section on this page. Try searching with different keywords or check another documentation page.';

    }

    const formattedSections =
        relevantSections.map(
            (section) => {

                return `
SECTION ID:
${section.id}

SECTION TITLE:
${section.heading}

CONTENT:
${section.content
                        .slice(0, 3)
                        .join('\n')}
`;
            }
        ).join('\n\n');

    const prompt = `
You are Docsense AI.

Current page:
${data.url}

Page title:
${data.title}

User question:
${userQuery}

Relevant documentation sections:
${formattedSections}

Your task:

- Answer the user's question using information from the current page whenever possible.
- Use the provided documentation sections as context.
- Explain how the current page relates to the user's goal.
- Mention the most relevant section title.
- If useful, suggest an implementation approach or code pattern.
- If the page only partially answers the question, explain what is missing.
- Do not simply tell the user to navigate somewhere.
- Be practical and action-oriented.
- Keep the response concise,short and readable.

Response Format:

Answer

SECTION: [exact section title if relevant]
`;

    const response =
        await askAI(
            prompt
        );

    return response;

}

function formatSearchResponse(text) {

    const lines =
        text.split('\n');

    let html = '';

    lines.forEach((line) => {

        if (
            line.startsWith('SECTION:')
        ) {

            const sectionTitle =
                line.replace(
                    'SECTION:',
                    ''
                ).trim();

            html += `
                <button
                    class="docsense-jump-btn"
                    data-section="${sectionTitle}"
                    style="
                        width:100%;
                        margin-top:10px;
                        padding:10px;
                        border:none;
                        border-radius:10px;
                        background:#27272a;
                        color:white;
                        cursor:pointer;
                    "
                >
                    Go to ${sectionTitle}
                </button>
            `;

        }

        else {

            html += `
                <div style="
                    margin-bottom:8px;
                ">
                    ${line}
                </div>
            `;

        }

    });

    setTimeout(() => {

        document
            .querySelectorAll(
                '.docsense-jump-btn'
            )
            .forEach((button) => {

                button.addEventListener(
                    'click',
                    () => {

                        const title =
                            button.dataset.section;

                        const section =
                            window.docsenseData.sections.find(
                                (s) =>
                                    s.heading === title
                            );

                        if (
                            section?.element
                        ) {

                            section.element.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });

                        }

                    }
                );

            });

    }, 0);

    return html;

}

function injectHeadingButtons(sections) {

    sections.forEach((sectionData) => {

        const headingElement = sectionData.element;

        const ignoredHeadings = [
            'example',
            'examples',
            'see also'
        ];

        if (
            ignoredHeadings.includes(
                sectionData.heading.toLowerCase()
            )
        ) {
            return;
        }

        if (
            headingElement.querySelector(
                '.docsense-heading-button'
            )
        ) {
            return;
        }

        const button =
            document.createElement('img');

        button.classList.add(
            'docsense-heading-button'
        );

        styleInjectedButton(button);

        button.addEventListener(
            'click',
            async (event) => {

                event.stopPropagation();

                const rect =
                    button.getBoundingClientRect();

                createAssistantPopup(
                    rect.right + 12,
                    rect.top + 4,
                    sectionData.heading
                );

                const popup =
                    document.querySelector(
                        '.docsense-popup'
                    );

                const responseElement =
                    popup.querySelector(
                        '.docsense-response'
                    );

                const combinedContent =
                    sectionData.heading +
                    '\n\n' +
                    sectionData.content.join('\n\n');

                console.log('ASKING AI...');

                const prompt =
                    buildDocumentationPrompt(
                        sectionData.heading,
                        combinedContent
                    );

                const aiResponse =
                    await askAI(prompt);

                console.log(
                    'AI RESPONSE:',
                    aiResponse
                );

                responseElement.innerHTML =
                    marked.parse(
                        typeof aiResponse === 'string'
                            ? aiResponse
                            : JSON.stringify(
                                aiResponse,
                                null,
                                2
                            )
                    );

            }
        );

        headingElement.appendChild(button);

    });

}

function injectCodeButtons(codeBlocks) {

    codeBlocks.forEach((codeData) => {

        const codeElement = codeData.element;

        if (
            codeElement.parentElement?.classList.contains(
                'docsense-code-wrapper'
            )
        ) {
            return;
        }

        const wrapper = document.createElement('div');

        wrapper.className =
            'docsense-code-wrapper';

        wrapper.style.position = 'relative';
        wrapper.style.display = 'block';

        codeElement.parentNode.insertBefore(
            wrapper,
            codeElement
        );

        wrapper.appendChild(codeElement);

        const button =
            document.createElement('img');

        styleInjectedButton(button);

        button.style.position = 'absolute';
        button.style.top = '10px';
        button.style.right = '10px';
        button.style.width = '22px';
        button.style.height = '22px';
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
        button.style.transition = 'opacity 0.2s ease';
        button.style.zIndex = '99999';

        wrapper.addEventListener(
            'mouseenter',
            () => {
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
            }
        );

        wrapper.addEventListener(
            'mouseleave',
            () => {
                button.style.opacity = '0';
                button.style.pointerEvents = 'none';
            }
        );

        button.addEventListener(
            'click',
            async (event) => {

                event.stopPropagation();

                const rect =
                    button.getBoundingClientRect();

                createAssistantPopup(
                    rect.right + 12,
                    rect.top + 4,
                    'Code Explanation'
                );

                const popup =
                    document.querySelector(
                        '.docsense-popup'
                    );

                const responseElement =
                    popup.querySelector(
                        '.docsense-response'
                    );

                console.log({
                    type: 'code',
                    code: codeData.text,
                    id: codeData.id
                });

                const prompt =
                    buildCodePrompt(
                        codeData.text
                    );

                const aiResponse =
                    await askAI(prompt);

                console.log(
                    'AI RESPONSE:',
                    aiResponse
                );

                responseElement.innerHTML =
                    marked.parse(
                        typeof aiResponse === 'string'
                            ? aiResponse
                            : JSON.stringify(
                                aiResponse,
                                null,
                                2
                            )
                    );

            }
        );

        wrapper.appendChild(button);

    });

}

function injectFloatingSearchButton() {

    if (
        document.querySelector(
            '.docsense-floating-search'
        )
    ) {
        return;
    }

    const button =
        document.createElement('div');

    button.className =
        'docsense-floating-search';

    button.innerHTML = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        stroke-width="2"
    />
    <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    />
</svg>
`;

    button.style.position = 'fixed';

    button.style.top = '20px';

    button.style.right = '20px';

    button.style.zIndex = '999999';

    button.style.width =
        '40px';

    button.style.height =
        '40px';

    button.style.display =
        'flex';

    button.style.alignItems =
        'center';

    button.style.justifyContent =
        'center';

    button.style.borderRadius =
        '999px';

    button.style.background =
        'rgba(139,92,246,0.08)';

    button.style.backdropFilter =
        'blur(8px)';

    button.style.border =
        '1px solid rgba(255,255,255,0.06)';

    button.style.color =
        'rgba(255,255,255,0.18)';

    button.style.fontWeight =
        '600';

    button.style.fontSize =
        '14px';

    button.style.cursor =
        'pointer';

    button.style.boxShadow =
        '0 4px 18px rgba(0,0,0,0.12)';

    button.style.fontFamily =
        'sans-serif';

    button.style.transition =
        'all 0.22s ease';

    button.addEventListener(
        'click',
        (event) => {

            event.stopPropagation();

            openSearchAssistant();

        }
    );

    document.body.appendChild(button);

    const selectionButton =
        document.createElement('div');

    selectionButton.className =
        'docsense-selection-toggle';

    selectionButton.innerHTML = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
`;

    selectionButton.style.position =
        'fixed';

    selectionButton.style.bottom =
        '20px';

    selectionButton.style.right =
        '20px';

    selectionButton.style.zIndex =
        '999999';

    selectionButton.style.width =
        '40px';

    selectionButton.style.height =
        '40px';

    selectionButton.style.display =
        'flex';

    selectionButton.style.alignItems =
        'center';

    selectionButton.style.justifyContent =
        'center';

    selectionButton.style.transition =
        'all 0.22s ease';

    selectionButton.style.borderRadius =
        '999px';

    selectionButton.style.background =
        'rgba(139,92,246,0.12)';

    selectionButton.style.border =
        '1px solid rgba(139,92,246,0.3)';

    selectionButton.style.color =
        'rgba(255,255,255,0.55)';

    selectionButton.style.boxShadow =
        '0 0 10px rgba(139,92,246,0.18)';

    selectionButton.style.backdropFilter =
        'blur(8px)';

    selectionButton.style.border =
        '1px solid rgba(255,255,255,0.06)';

    selectionButton.style.color =
        'rgba(255,255,255,0.18)';

    selectionButton.style.cursor =
        'pointer';

    selectionButton.style.fontFamily =
        'sans-serif';

    selectionButton.addEventListener(
        'click',
        (event) => {

            event.stopPropagation();

            selectionMode =
                !selectionMode;

            if (selectionMode) {

                selectionButton.style.background =
                    'rgba(139,92,246,0.4)';

                selectionButton.style.border =
                    '1px solid rgba(139,92,246,0.8)';

                selectionButton.style.color =
                    'white';

                selectionButton.style.boxShadow =
                    '0 0 24px rgba(139,92,246,0.65)';

            }
            else {

                selectionButton.style.background =
                    'rgba(139,92,246,0.12)';

                selectionButton.style.border =
                    '1px solid rgba(139,92,246,0.3)';

                selectionButton.style.color =
                    'rgba(255,255,255,0.55)';

                selectionButton.style.boxShadow =
                    '0 0 10px rgba(139,92,246,0.18)';

            }

            selectionButton.innerHTML =
                selectionMode
                    ? `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
`
                    : `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
`;
        }
    );

    document.body.appendChild(
        selectionButton
    );

    selectionButton.addEventListener(
        'mouseenter',
        () => {

            selectionButton.innerHTML =
                selectionMode
                    ? `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
<span style="margin-left:8px">
    ON
</span>
`
                    : `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
<span style="margin-left:8px">
    OFF
</span>
`;

            selectionButton.style.width =
                '70px';

        }
    );

    selectionButton.addEventListener(
        'mouseleave',
        () => {

            selectionButton.innerHTML =
                selectionMode
                    ? `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
`
                    : `
<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
</svg>
`;
            selectionButton.style.width =
                '40px';

        }
    );

    button.addEventListener(
        'mouseenter',
        () => {

            button.innerHTML = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        stroke-width="2"
    />
    <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    />
</svg>
<span style="margin-left:8px">
    Search Assistant
</span>
`;

            button.style.width =
                '170px';

            button.style.background =
                'rgba(139,92,246,0.92)';

            button.style.color =
                'white';

        }
    );

    button.addEventListener(
        'mouseleave',
        () => {

            button.innerHTML = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        stroke-width="2"
    />
    <path
        d="M20 20L16.5 16.5"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    />
</svg>
`;

            button.style.width =
                '40px';

            button.style.background =
                'rgba(139,92,246,0.08)';

            button.style.color =
                'rgba(255,255,255,0.18)';

        }
    );

}

function initializeSelectionMode() {

    document.addEventListener(
        'mouseup',
        () => {

            if (!selectionMode) {
                return;
            }

            const text =
                window.getSelection()
                    .toString()
                    .trim();

            if (!text) {
                return;
            }

            selectedText = text;

            console.log(
                'SELECTED:',
                selectedText
            );

            const oldButton =
                document.querySelector(
                    '.docsense-selection-explain'
                );

            if (oldButton) {
                oldButton.remove();
            }

            showSelectionExplainButton();

        }
    );

}

function showSelectionExplainButton() {

    const oldButton =
        document.querySelector(
            '.docsense-selection-explain'
        );

    if (oldButton) {
        oldButton.remove();
    }

    const selection =
        window.getSelection();

    if (!selection.rangeCount) {
        return;
    }

    const rect =
        selection
            .getRangeAt(0)
            .getBoundingClientRect();

    const button =
        document.createElement('div');

    button.className =
        'docsense-selection-explain';

    button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                stroke-width="2"
            />
            <path
                d="M20 20L16.5 16.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>
        <span style="margin-left:8px">
            Explain
        </span>
    `;

    button.style.position =
        'fixed';

    const left =
        Math.min(
            rect.right + 10,
            window.innerWidth - 120
        );

    button.style.left =
        `${left}px`;

    button.style.top =
        `${rect.top - 10}px`;

    button.style.zIndex =
        '999999';

    button.style.padding =
        '8px 12px';

    button.style.borderRadius =
        '999px';

    button.style.background =
        '#8b5cf6';

    button.style.color =
        'white';

    button.style.cursor =
        'pointer';

    button.style.display =
        'flex';

    button.style.alignItems =
        'center';

    button.style.justifyContent =
        'center';

    button.style.gap =
        '8px';

    button.style.whiteSpace =
        'nowrap';

    button.addEventListener(
        'click',
        async () => {

            button.remove();

            createAssistantPopup(
                window.innerWidth - 450,
                120,
                'Selected Text'
            );

            const popup =
                document.querySelector(
                    '.docsense-popup'
                );

            const responseElement =
                popup.querySelector(
                    '.docsense-response'
                );

            responseElement.innerText =
                'Thinking...';

            try {

                const prompt =
                    buildSelectionPrompt(
                        selectedText
                    );

                const aiResponse =
                    await askAI(prompt);

                console.log(
                    'AI RESPONSE:',
                    aiResponse
                );

                console.log(
                    'RESPONSE ELEMENT:',
                    responseElement
                );

                responseElement.innerHTML =
                    marked.parse(
                        aiResponse
                    );

            }

            catch (error) {

                console.error(error);

                responseElement.innerHTML =
                    renderAIResponse(
                        'Failed to get AI response.'
                    );

            }

        }
    );

    document.body.appendChild(
        button
    );

}

document.addEventListener(
    'mousedown',
    (event) => {

        const explainButton =
            document.querySelector(
                '.docsense-selection-explain'
            );

        if (!explainButton) {
            return;
        }

        if (
            !explainButton.contains(
                event.target
            )
        ) {
            explainButton.remove();
        }

    }
);

document.addEventListener(
    'click',
    (event) => {

        const popup =
            document.querySelector(
                '.docsense-popup'
            );

        if (!popup) {
            return;
        }

        if (
            event.target.closest(
                '.docsense-selection-explain'
            )
        ) {
            return;
        }

        if (
            !popup.contains(
                event.target
            )
        ) {
            popup.remove();
        }

    }
);

function initializeDocsense() {

    const extractedData = extractPageData();

    window.docsenseData = extractedData;

    console.log('EXTRACTED DATA');
    console.log(extractedData);

    if (extractedData) {

        injectHeadingButtons(extractedData.sections);

        injectCodeButtons(extractedData.codeBlocks);

        injectFloatingSearchButton();

        initializeSelectionMode();

    }

}