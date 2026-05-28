console.log('CONTENT JS RUNNING');

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
                currentElement.textContent.trim();

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

// ==============================
// EXTRACT PAGE DATA
// ==============================

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

// ==============================
// STYLE AI BUTTON
// ==============================

function styleInjectedButton(button) {

    button.src = chrome.runtime.getURL('images/logo.png');

    button.alt = 'Docsense AI';

    button.style.width = '22px';
    button.style.height = '22px';

    button.style.minWidth = '22px';
    button.style.minHeight = '22px';

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

    button.addEventListener('mouseenter', () => {

        button.style.transform = 'scale(1.12)';
        button.style.opacity = '1';

    });

    button.addEventListener('mouseleave', () => {

        button.style.transform = 'scale(1)';
        button.style.opacity = '0.88';

    });

}



// ==============================
// INJECT HEADING BUTTONS
// ==============================

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
                    aiResponse
                        .replace(/\n/g, '<br>');

            }
        );



    document.body.appendChild(popup);

}

async function askAI(contextTitle, contextText) {

    return new Promise((resolve) => {

        chrome.storage.local.get(
            ['geminiApiKey'],
            (result) => {

                const apiKey = result.geminiApiKey;

                if (!apiKey) {
                    resolve('No Gemini API key found.');
                    return;
                }

                const prompt = `
You are Docsense AI, an assistant that helps developers understand technical documentation pages.

Current page URL:
${window.location.href}

SECTION TITLE:
${contextTitle}

SECTION CONTENT:
${contextText}

First give a short 1-2 line explanation.
Then under "Full Explanation" explain the concept in a more beginner-friendly and practical way.
Keep the response concise because the popup has limited space.

If the title is generic like "Overview" or "Description", then use the page URL and surrounding content to understand the actual documentation topic.

Keep the explanation concise and practical.
`;

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

                return userQuery
                    .toLowerCase()
                    .split(' ')
                    .some(word =>
                        combined.includes(word)
                    );

            })
            .slice(0, 5);

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
                        .slice(0, 2)
                        .join('\n')}
`;
            }
        ).join('\n\n');

    const prompt = `
You are Docsense AI.

You help developers navigate documentation.

Current page:
${data.url}

Page title:
${data.title}

User question:
${userQuery}

Relevant documentation sections:
${formattedSections}

Your task:
- Guide the user to the most relevant section
- Mention section names clearly
- If this page does not contain the answer, say so
- Suggest what kind of documentation/page the user should search for instead
- Keep response concise and practical
`;

    const response =
        await askAI(
            'Documentation Search',
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
            'overview',
            'description',
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
            sectionData.content.join(' ').length < 120
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

                const aiResponse =
                    await askAI(
                        sectionData.heading,
                        combinedContent
                    );

                console.log(
                    'AI RESPONSE:',
                    aiResponse
                );

                responseElement.innerText =
                    typeof aiResponse === 'string'
                        ? aiResponse
                        : JSON.stringify(
                            aiResponse,
                            null,
                            2
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

                const aiResponse =
                    await askAI(
                        'Code Explanation',
                        codeData.text
                    );

                responseElement.innerText =
                    typeof aiResponse === 'string'
                        ? aiResponse
                        : JSON.stringify(
                            aiResponse,
                            null,
                            2
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

    button.innerText = 'Docsense AI';

    button.style.position = 'fixed';

    button.style.top = '20px';

    button.style.right = '20px';

    button.style.zIndex = '999999';

    button.style.padding =
        '10px 16px';

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

    button.addEventListener(
        'mouseenter',
        () => {

            button.style.background =
                'rgba(139,92,246,0.92)';

            button.style.color =
                'white';

            button.style.transform =
                'translateY(-2px)';

        }
    );

    button.addEventListener(
        'mouseleave',
        () => {

            button.style.background =
                'rgba(139,92,246,0.08)';

            button.style.color =
                'rgba(255,255,255,0.18)';

            button.style.transform =
                'translateY(0px)';

        }
    );

}


document.addEventListener('click', (event) => {

    const popup = document.querySelector('.docsense-popup');

    if (!popup) return;

    if (!popup.contains(event.target)) {

        popup.remove();

    }

});

function initializeDocsense() {

    const extractedData = extractPageData();

    window.docsenseData = extractedData;

    console.log('EXTRACTED DATA');
    console.log(extractedData);

    if (extractedData) {

        injectHeadingButtons(extractedData.sections);

        injectCodeButtons(extractedData.codeBlocks);

        injectFloatingSearchButton();

    }

}