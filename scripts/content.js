
(() => {
    if (window.docsenseInjected) {
        return;
    }

    window.docsenseInjected = true;

    let selectionMode = false;
    let cheatModeEnabled = false;

    chrome.storage.local.get(['docsenseCheatModeEnabled'], (result) => {
        cheatModeEnabled = result.docsenseCheatModeEnabled === true;
        applyCheatMode();
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (
            areaName === 'local' &&
            changes.docsenseCheatModeEnabled
        ) {
            cheatModeEnabled =
                changes.docsenseCheatModeEnabled.newValue === true;

            applyCheatMode();
        }
    });

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
            return element;
        }

    }



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
        return null;
    }



    return {

        url: window.location.href,

        title: document.title,

        sections: extractSections(root),

        codeBlocks: extractCodeBlocks(root)

    };

}

function addDocsenseTooltip(button) {
    const tooltip = document.createElement('span');

    tooltip.textContent =
        'Click to explain · Right-click to ask anything';

    tooltip.style.cssText = `
        position: fixed;
        display: none;
        padding: 7px 10px;
        background: #1c1c1c;
        color: white;
        border: 1px solid #444;
        border-radius: 8px;
        font: 12px/1.4 sans-serif;
        white-space: nowrap;
        z-index: 2147483647;
        pointer-events: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    `;

    document.body.appendChild(tooltip);

    button.addEventListener('mouseenter', () => {
        const rect = button.getBoundingClientRect();

        tooltip.style.left = `${Math.min(
            rect.left,
            window.innerWidth - tooltip.offsetWidth - 12
        )}px`;

        tooltip.style.top = `${rect.bottom + 6}px`;
        tooltip.style.display = 'block';
    });

    button.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });
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

    addDocsenseTooltip(button);

}

function addDocsenseMaximizeButton(popup) {

    let previousStyles = null;
    let isMaximized = false;

    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'docsense-maximize-btn';
    button.textContent = '⛶';
    button.title = 'Maximize';
    button.setAttribute('aria-label', 'Maximize popup');

    button.style.cssText = `
        position:absolute;
        top:10px;
        right:42px;
        width:28px;
        height:28px;
        display:flex;
        align-items:center;
        justify-content:center;
        border:1px solid rgba(255,255,255,0.18);
        border-radius:7px;
        background:rgba(255,255,255,0.08);
        color:white;
        font-size:19px;
        line-height:1;
        cursor:pointer;
        z-index:10;
        padding:0;
    `;

    button.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });

    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isMaximized) {

            // Save the popup's exact current inline styles.
            previousStyles = popup.style.cssText;

            const expandButton = popup.querySelector(
                '.docsense-expand-btn, .docsense-custom-expand'
            );

            const responseElement = popup.querySelector(
                '.docsense-response, .docsense-custom-response'
            );

            // Save the button's original display value and response area's styles.
            if (expandButton) {
                button.dataset.expandDisplay = expandButton.style.display;
                expandButton.style.display = 'none';
            }

            if (responseElement) {
                responseElement.dataset.previousMaxHeight =
                    responseElement.style.maxHeight;

                responseElement.dataset.previousMarginBottom =
                    responseElement.style.marginBottom;

                responseElement.style.setProperty('max-height', 'none', 'important');
                responseElement.style.setProperty('flex', '1', 'important');
                responseElement.style.setProperty('min-height', '0', 'important');
                responseElement.style.setProperty('margin-bottom', '0', 'important');
            }

            // Use the viewport as the reference while maximized.
            popup.style.setProperty('position', 'fixed', 'important');
            popup.style.setProperty('top', '7.5vh', 'important');
            popup.style.setProperty('left', '7.5vw', 'important');
            popup.style.setProperty('right', 'auto', 'important');
            popup.style.setProperty('bottom', 'auto', 'important');
            popup.style.setProperty('width', '85vw', 'important');
            popup.style.setProperty('height', '85vh', 'important');
            popup.style.setProperty('max-width', '85vw', 'important');
            popup.style.setProperty('max-height', '85vh', 'important');
            popup.style.setProperty('box-sizing', 'border-box', 'important');
            popup.style.setProperty('overflow-y', 'auto', 'important');
            popup.style.setProperty('overflow-x', 'hidden', 'important');
            popup.style.setProperty('z-index', '2147483647', 'important');

            isMaximized = true;

            button.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" stroke-width="2.5"
                     stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2.5" y="2.5" width="19" height="19" rx="3"/>
                    <path d="M7 7L13 13"/>
                    <path d="M7 13H13V7"/>
                </svg>
            `;
            button.title = 'Restore previous size';
            button.setAttribute('aria-label', 'Restore previous size');

        } else {

            // Restore the exact styles from before maximizing.
            popup.style.cssText = previousStyles;

            const expandButton = popup.querySelector(
                '.docsense-expand-btn, .docsense-custom-expand'
            );

            const responseElement = popup.querySelector(
                '.docsense-response, .docsense-custom-response'
            );

            if (expandButton) {
                expandButton.style.display =
                    button.dataset.expandDisplay || '';
            }

            if (responseElement) {
                responseElement.style.maxHeight =
                    responseElement.dataset.previousMaxHeight || '';

                responseElement.style.flex = '';
                responseElement.style.minHeight = '';

                responseElement.style.marginBottom =
                    responseElement.dataset.previousMarginBottom || '';
            }

            isMaximized = false;

            button.textContent = '⛶';
            button.title = 'Maximize';
            button.setAttribute('aria-label', 'Maximize popup');
        }
    });

    // Ensure the button is positioned relative to the popup.
    if (getComputedStyle(popup).position === 'static') {
        popup.style.position = 'relative';
    }

    // Pin button: prevents outside clicks from closing the popup.
    const pinButton = document.createElement('button');

    pinButton.type = 'button';
    pinButton.className = 'docsense-pin-btn';
    pinButton.innerHTML = `
        <svg width="17" height="17" viewBox="0 0 24 24"
             fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round"
             stroke-linejoin="round" aria-hidden="true">
            <path d="m16 3 5 5-4 1-4 4-1 4-3-3-3-3 4-1z"/>
            <path d="m10 14-7 7"/>
        </svg>
    `;
    pinButton.title = 'Pin popup';
    pinButton.setAttribute('aria-label', 'Pin popup');

    pinButton.style.cssText = `
        position:absolute;
        top:10px;
        right:76px;
        width:28px;
        height:28px;
        display:flex;
        align-items:center;
        justify-content:center;
        border:1px solid rgba(255,255,255,0.18);
        border-radius:7px;
        background:rgba(255,255,255,0.08);
        color:white;
        font-size:20px;
        line-height:1;
        cursor:pointer;
        z-index:10;
        padding:0;
    `;

    pinButton.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });

    pinButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isPinned = popup.dataset.pinned === 'true';
        const nextPinned = !isPinned;

        popup.dataset.pinned = String(nextPinned);

        pinButton.innerHTML = nextPinned
            ? `<svg width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
                   <path d="m16 3 5 5-4 1-4 4-1 4-3-3-3-3 4-1z"/>
                   <path d="m10 14-7 7"/>
                   <path d="m4 4 16 16"/>
               </svg>`
            : `<svg width="17" height="17" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor"
                   stroke-width="1.8" stroke-linecap="round"
                   stroke-linejoin="round" aria-hidden="true">
                   <path d="m16 3 5 5-4 1-4 4-1 4-3-3-3-3 4-1z"/>
                   <path d="m10 14-7 7"/>
               </svg>`;
        pinButton.title = nextPinned ? 'Unpin popup' : 'Pin popup';
        pinButton.setAttribute(
            'aria-label',
            nextPinned ? 'Unpin popup' : 'Pin popup'
        );

        pinButton.style.background = nextPinned
            ? 'rgba(139,92,246,0.25)'
            : 'rgba(255,255,255,0.08)';

        pinButton.style.borderColor = nextPinned
            ? 'rgba(139,92,246,0.9)'
            : 'rgba(255,255,255,0.18)';

        pinButton.style.color = nextPinned ? '#c4b5fd' : 'white';

        pinButton.style.boxShadow = nextPinned
            ? '0 0 12px rgba(139,92,246,0.35)'
            : 'none';
    });

    popup.appendChild(pinButton);
    popup.appendChild(button);
}

function removeExistingPopup() {

    document
        .querySelectorAll('.docsense-popup')
        .forEach((popup) => popup.remove());

}

function enablePopupDragging(popup, ignoreSelector = '') {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function onMouseDown(event) {
        if (event.button !== 0 || !(event.target instanceof Element)) {
            return;
        }

        if (
            event.target.closest(
                '.docsense-response, .docsense-custom-response, ' +
                '.docsense-search-response, .docsense-search-input, ' +
                '.docsense-custom-input, button, textarea, input, a'
            )
        ) {
            return;
        }

        if (
            ignoreSelector &&
            event.target.closest(ignoreSelector)
        ) {
            return;
        }

        if (window.getSelection()?.toString()) return;

        const rect = popup.getBoundingClientRect();
        isDragging = true;
        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        popup.style.position = 'fixed';
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.top}px`;
        popup.style.right = 'auto';
        popup.style.bottom = 'auto';

        event.preventDefault();
    }

    function onMouseMove(event) {
        if (!isDragging || !popup.isConnected) return;

        const maxLeft = Math.max(0, window.innerWidth - popup.offsetWidth);
        const maxTop = Math.max(0, window.innerHeight - popup.offsetHeight);

        popup.style.left =
            `${Math.max(0, Math.min(event.clientX - offsetX, maxLeft))}px`;

        popup.style.top =
            `${Math.max(0, Math.min(event.clientY - offsetY, maxTop))}px`;
    }

    function onMouseUp() {
        isDragging = false;
    }

    popup.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    const observer = new MutationObserver(() => {
        if (!popup.isConnected) {
            popup.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
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
                position:absolute;
                top:10px;
                right:10px;
                width:28px;
                height:28px;
                min-width:28px;
                min-height:28px;
                display:flex;
                align-items:center;
                justify-content:center;
                box-sizing:border-box;
                flex-shrink:0;
                padding:0;
                margin:0;
                border:none;
                border-radius:0;
                background:transparent;
                color:white;
                cursor:pointer;
                opacity:0.7;
                font-size:22px;
                line-height:1;
            ">
                ×
            </div>

        </div>

        <div style="
            font-size:16px;
            font-weight:600;
            margin-bottom:10px;
        ">
            ${escapeCustomHTML(headingText)}
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
            (event) => {

                event.stopPropagation();

                const expandButton = popup.querySelector('.docsense-expand-btn');

                expandButton.style.display = 'none';

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
    addDocsenseMaximizeButton(popup);

    enablePopupDragging(popup, '.docsense-close-btn');

}


function openCustomPromptDialog(x, y, contextTitle, contextContent) {

    removeExistingPopup();

    const popup = document.createElement('div');
    popup.className = 'docsense-popup docsense-custom-dialog';

    popup.style.cssText = `
        position:fixed;
        top:${Math.max(12, Math.min(y, window.innerHeight - 340))}px;
        left:${Math.max(12, Math.min(x, window.innerWidth - 440))}px;
        width:420px;
        max-width:calc(100vw - 24px);
        max-height:80vh;
        overflow-y:auto;
        box-sizing:border-box;
        padding:16px;
        border-radius:16px;
        background:rgba(20,20,20,0.97);
        color:white;
        font:14px/1.6 sans-serif;
        z-index:999999;
        box-shadow:0 8px 24px rgba(0,0,0,0.35);
        border:1px solid rgba(255,255,255,0.12);
    `;

    popup.innerHTML = `
        <div class="docsense-custom-header"
             style="display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:12px">
            <div style="font-weight:700;font-size:18px">Docsense AI</div>
            <button type="button" class="docsense-custom-close"
                aria-label="Close"
                style="
                    position:absolute;
                    top:10px;
                    right:10px;
                    width:28px;
                    height:28px;
                    min-width:28px;
                    min-height:28px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    box-sizing:border-box;
                    padding:0;
                    margin:0;
                    border:none;
                    border-radius:0;
                    background:transparent;
                    color:white;
                    font-size:22px;
                    font-weight:400;
                    line-height:1;
                    cursor:pointer;
                    opacity:0.85;
                ">×</button>
        </div>

        <div style="margin-bottom:10px;color:#c4b5fd">
            Custom Prompt
        </div>

        <div style="font-size:12px;opacity:.7;margin-bottom:8px">
            Context: ${escapeCustomHTML(contextTitle)}
        </div>

        <div class="docsense-prompt-row"
             style="display:flex;align-items:flex-end;gap:10px;margin-top:4px">

            <textarea class="docsense-custom-input"
                placeholder="Ask a follow-up question..."
                rows="1"
                style="flex:1;width:0;min-width:0;height:44px;min-height:44px;
                       max-height:140px;box-sizing:border-box;padding:11px 12px;
                       border:1px solid #444;border-radius:12px;
                       background:#111;color:white;resize:none;
                       overflow-y:hidden;font:inherit;line-height:1.5"></textarea>

            <button type="button" class="docsense-custom-ask"
                style="flex-shrink:0;height:44px;padding:0 16px;
                       border:0;border-radius:12px;background:#8b5cf6;
                       color:white;font-weight:600;font-size:14px;
                       cursor:pointer;white-space:nowrap">
                Ask Docsense
            </button>

        </div>

        <div class="docsense-custom-response"
             style="margin-top:14px;max-height:300px;overflow-y:auto;
                    overflow-wrap:anywhere"></div>

        <button type="button" class="docsense-custom-expand"
            style="width:100%;margin-top:12px;padding:12px;border:0;
                   border-radius:10px;background:#8b5cf6;color:white;
                   font-weight:600;font-size:14px;cursor:pointer">
            Expand
        </button>
    `;

    document.body.appendChild(popup);
    addDocsenseMaximizeButton(popup);

    enablePopupDragging(
        popup,
        '.docsense-custom-close, .docsense-custom-ask, .docsense-custom-expand'
    );

    const input = popup.querySelector('.docsense-custom-input');

    function resizeCustomInput() {
        input.style.height = '44px';

        const maxHeight = 140;
        const nextHeight = Math.min(input.scrollHeight, maxHeight);

        input.style.height = `${nextHeight}px`;

        input.style.overflowY =
            input.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }

    input.addEventListener('input', resizeCustomInput);

    const askButton = popup.querySelector('.docsense-custom-ask');
    const responseElement =
        popup.querySelector('.docsense-custom-response');
    const expandButton =
        popup.querySelector('.docsense-custom-expand');

    expandButton.addEventListener('click', (event) => {
        event.stopPropagation();

        popup.style.width = '620px';
        popup.style.maxWidth = '95vw';
        popup.style.height = '75vh';
        popup.style.maxHeight = '80vh';

        responseElement.style.maxHeight = '60vh';

        expandButton.style.display = 'none';

        // Keep the enlarged popup inside the viewport.
        const rect = popup.getBoundingClientRect();

        if (rect.right > window.innerWidth) {
            popup.style.left = `${Math.max(12, window.innerWidth - rect.width - 12)}px`;
        }

        if (rect.bottom > window.innerHeight) {
            popup.style.top = `${Math.max(12, window.innerHeight - rect.height - 12)}px`;
        }
    });

    popup.querySelector('.docsense-custom-close')
        .addEventListener('click', (event) => {
            event.stopPropagation();
            popup.remove();
        });

    // Interactions inside this popup must not trigger page-level handlers.
    popup.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    askButton.addEventListener('click', async (event) => {

        event.stopPropagation();

        const instruction = input.value.trim();

        if (!instruction) {
            responseElement.innerText =
                'Please enter an instruction first.';
            input.focus();
            return;
        }

        askButton.disabled = true;
        askButton.innerText = 'Thinking...';
        responseElement.innerText = 'Thinking...';

        const prompt = `
You are Docsense AI, a helpful programming and learning assistant.

Current page URL:
${window.location.href}

Context title:
${contextTitle}

Relevant page content:
${contextContent}

User's custom instruction:
${instruction}

Follow the user's instruction directly. Start with the answer, not a greeting,
introduction, or announcement about being an AI assistant.

Avoid generic openings such as "Hello!", "Hi!", or "I am Docsense AI".
Do not repeat the user's question unnecessarily.

Use clear, readable Markdown with appropriate headings, lists, code blocks,
and tables when useful.

If a brief contextual note or limitation is genuinely useful, include it
at the end. Do not add unnecessary closing remarks or invitations for
further questions.

If the user asks about a related topic outside the supplied context,
you may use general knowledge and clearly distinguish it from page content.
Never claim that information appears on the page if it does not.
`;

        try {

            const answer = await askAI(prompt);

            if (!popup.isConnected) return;

            responseElement.innerHTML =
                renderSafeMarkdown(String(answer));

        } catch (error) {

            console.error('Docsense custom prompt error:', error);

            responseElement.innerText =
                'Could not get a response. Please try again.';

        } finally {

            askButton.disabled = false;
            askButton.innerText = 'Ask Docsense';

        }
    });

    input.focus();
}

function escapeCustomHTML(value) {

    const element = document.createElement('span');
    element.textContent = String(value ?? '');

    return element.innerHTML;
}

function renderSafeMarkdown(markdown) {
    const parsedHTML = marked.parse(String(markdown ?? ''));
    const parser = new DOMParser();
    const doc = parser.parseFromString(parsedHTML, 'text/html');

    const allowedTags = new Set([
        'P', 'BR', 'HR',
        'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
        'STRONG', 'B', 'EM', 'I', 'DEL',
        'UL', 'OL', 'LI',
        'BLOCKQUOTE', 'PRE', 'CODE',
        'A', 'TABLE', 'THEAD', 'TBODY',
        'TR', 'TH', 'TD',
        'DIV', 'SPAN'
    ]);

    const allowedAttributes = new Set([
        'href', 'title', 'class'
    ]);

    function cleanNode(node) {
        for (const child of [...node.childNodes]) {
            if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
                continue;
            }

            if (child.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            if (!allowedTags.has(child.tagName)) {
                if ([
                    'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT',
                    'EMBED', 'FORM', 'SVG', 'MATH',
                    'VIDEO', 'AUDIO'
                ].includes(child.tagName)) {
                    child.remove();
                } else {
                    cleanNode(child);
                    child.replaceWith(...child.childNodes);
                }
                continue;
            }

            for (const attr of [...child.attributes]) {
                const name = attr.name.toLowerCase();

                if (!allowedAttributes.has(name)) {
                    child.removeAttribute(attr.name);
                    continue;
                }

                if (name === 'href') {
                    try {
                        const url = new URL(
                            attr.value,
                            window.location.href
                        );

                        if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) {
                            child.removeAttribute('href');
                        }
                    } catch {
                        child.removeAttribute('href');
                    }
                }
            }

            cleanNode(child);
        }
    }

    cleanNode(doc.body);

    return doc.body.innerHTML;
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
            padding-right:36px;
        ">
            Docsense AI
        </div>

        <button type="button" class="docsense-search-close"
            aria-label="Close"
            style="
                position:absolute;
                top:10px;
                right:10px;
                width:28px;
                height:28px;
                min-width:28px;
                min-height:28px;
                display:flex;
                align-items:center;
                justify-content:center;
                box-sizing:border-box;
                padding:0;
                border:none;
                background:transparent;
                color:white;
                font-size:22px;
                line-height:1;
                cursor:pointer;
                opacity:0.85;
            ">×</button>

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
            class="docsense-search-response docsense-custom-response"
            style="
                margin-top:16px;
                max-height:55vh;
                overflow-y:auto;
                overflow-x:hidden;
                line-height:1.7;
                opacity:1;
                padding-right:6px;
                overflow-wrap:anywhere;
            "
        ></div>
    `;

    const askButton =
        popup.querySelector('.docsense-search-btn');

    askButton.addEventListener(
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

            responseElement.innerText = 'Thinking...';
            askButton.disabled = true;
            askButton.innerText = 'Searching...';

            try {
                const aiResponse = await askSearchAI(userQuery);

                if (!popup.isConnected) return;

                const errorMessages = [
                    'No Gemini API key found.',
                    'Failed to contact background service worker.',
                    'Gemini API quota exceeded.',
                    'Gemini is currently under heavy load.',
                    'AI response parsing failed',
                    'Unknown AI error'
                ];

                const isError =
                    typeof aiResponse === 'string' &&
                    errorMessages.some(message =>
                        aiResponse.includes(message)
                    );

                if (isError) {
                    responseElement.innerText = aiResponse;
                } else {
                    responseElement.innerHTML =
                        formatSearchResponse(aiResponse);
                }

            } catch (error) {
                console.error(
                    'DocSenseAI Search Assistant error:',
                    error
                );

                if (popup.isConnected) {
                    responseElement.innerText =
                        'Something went wrong while searching. Please try again.';
                }

            } finally {
                if (popup.isConnected) {
                    askButton.disabled = false;
                    askButton.innerText = 'Ask';
                }
            }
        }
    );



    document.body.appendChild(popup);
    addDocsenseMaximizeButton(popup);
    enablePopupDragging(popup, '.docsense-search-close');
    popup.querySelector('.docsense-search-close')
        .addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            popup.remove();
        });

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

IMPORTANT OPENING RULES:
- Start immediately with the explanation of the topic.
- Never begin with a greeting such as "Hello" or "Hi".
- Never introduce yourself as Docsense AI.
- Never announce that you are about to explain or summarize the section.
- Do not write phrases like "Here is the overview" or "Let's explore".
- The first sentence must contain useful information about the topic.

Give a very short overview in 1-2 sentences describing what this section is about.

Then provide:

## Full Explanation

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

IMPORTANT OPENING RULES:
- Start directly by explaining what the code does.
- Never greet the user or introduce yourself as Docsense AI.
- Do not announce that you are about to explain the code.
- Avoid generic openings such as "Hello", "Here is the explanation",
  or "Let's break this down".
- The first sentence must explain the code's purpose.

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

IMPORTANT OPENING RULES:
- Begin directly with the selected content's meaning.
- Never greet the user or introduce yourself as Docsense AI.
- Do not announce that you are going to explain the content.
- Avoid generic openings such as "Hello" or "Here is an overview".
- Start with useful information about the selected content.

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
            ['geminiApiKey', 'geminiModel'],
            (result) => {

                const apiKey = result.geminiApiKey;
                const geminiModel = result.geminiModel || 'gemini-3.5-flash-lite';

                if (!apiKey) {
                    resolve('No Gemini API key found.');
                    return;
                }



                chrome.runtime.sendMessage(
                    {
                        type: 'ASK_GEMINI',
                        prompt,
                        apiKey,
                        model: geminiModel
                    },

                    (response) => {

                        if (chrome.runtime.lastError) {
                            console.error(chrome.runtime.lastError);
                            resolve('Failed to contact background service worker.');
                            return;
                        }

                        try {

                            if (response?.error) {

                                const errorMessage =
                                    response.error.message ||
                                    'Unknown AI error';

                                const lower =
                                    errorMessage.toLowerCase();

                                if (
                                    lower.includes('quota') ||
                                    lower.includes('429')
                                ) {

                                    resolve(
                                        'Gemini API quota exceeded.\n\nYour API key has reached its usage limit.\n\nPlease wait for quota reset or use another API key.'
                                    );

                                    return;

                                }

                                if (
                                    lower.includes('503') ||
                                    lower.includes('busy') ||
                                    lower.includes('overloaded') ||
                                    lower.includes('unavailable')
                                ) {

                                    resolve(
                                        'Gemini is currently under heavy load.\n\nRetrying after a few seconds often fixes this issue.'
                                    );

                                    return;

                                }

                                resolve(errorMessage);

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
You are DocSenseAI, a documentation learning and implementation assistant.

CURRENT PAGE:
${data.url}

PAGE TITLE:
${data.title}

USER QUESTION:
${userQuery}

RELEVANT DOCUMENTATION SECTIONS:
${formattedSections}

Your goal is to help the user LEARN from the documentation and then
apply that knowledge to solve their problem.

Write the response in these three parts, in this exact order.

## 1. Learn the Relevant Sections

Identify the documentation sections that help the user understand
the concepts needed to solve their problem.

For each section:
- Give its exact title from the supplied documentation.
- Explain what the user should learn from it.
- Explain why that knowledge matters for their specific goal.

Recommend sections based on relevance, not simply because they
appear in the supplied extracts. Include only sections that genuinely
help the user.

## 2. How the Concepts Work Together

Explain how the recommended sections connect to one another.
Show how the concepts build toward the user's goal.

Do not repeat the first section or jump straight into the full solution.

## 3. Full Process — Complete Solution

Now answer the user's original question with a complete, practical
solution.

- Give ordered implementation steps.
- Include relevant, usable code examples when appropriate.
- Explain where the code belongs and how it works.
- Explain important configuration and common mistakes.
- Make the solution consistent with the concepts discussed above.
- If required information is missing from the supplied documentation,
  clearly identify assumptions or additional knowledge being used.

STYLE:
- Start immediately with useful content; no greetings or self-introductions.
- Use readable Markdown, short paragraphs, headings, lists, and code blocks.
- Be specific and technically accurate.
- Do not repeat information unnecessarily.
- Adapt the depth to the complexity of the question.
- If the question is very simple, keep the learning section brief.
- If no relevant sections were found, say so honestly rather than inventing
  section titles.
- Never invent documentation section titles or claim that an unprovided
  section supports a statement.

RELEVANT SECTION NAVIGATION:

For every recommended documentation section:

1. Explain what the user should learn from it.
2. Explain why it helps with their goal.
3. Immediately output SECTION: Exact Section Title on its own line.

Do not collect all SECTION lines at the end.
Place each marker directly after its recommendation.
Do not put SECTION markers inside code blocks.
Do not add SECTION markers to the final solution.
Use only exact section titles supplied in the documentation context.
Return at most 3 SECTION markers.
`;

    const response =
        await askAI(
            prompt
        );

    return response;

}

function formatSearchResponse(text) {
    const lines = String(text ?? '').split(/\r?\n/);
    const container = document.createElement('div');

    let markdownBuffer = '';

    const sections = window.docsenseData?.sections || [];
    const addedTitles = new Set();

    function flushMarkdown() {
        if (!markdownBuffer.trim()) {
            markdownBuffer = '';
            return;
        }

        const content = document.createElement('div');
        content.innerHTML = renderSafeMarkdown(markdownBuffer);
        container.appendChild(content);
        markdownBuffer = '';
    }

    function addSectionButton(rawTitle) {
        const title = rawTitle
            .replace(/\*\*/g, '')
            .replace(/`/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        if (!title || /^\[.*\]$/.test(title)) return;

        const normalizedTitle = title.toLowerCase();

        if (addedTitles.has(normalizedTitle)) return;

        const normalize = value =>
            String(value ?? '')
                .replace(/\s+/g, ' ')
                .trim()
                .toLowerCase();

        const section = sections.find(
            item => normalize(item.heading) === normalizedTitle
        );

        // Never display a navigation button for a nonexistent heading.
        if (!section?.element) return;

        addedTitles.add(normalizedTitle);

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'docsense-jump-btn';
        button.textContent = `Go to ${section.heading}`;
        button.dataset.section = section.heading;

        button.style.cssText = `
            width:100%;
            margin-top:10px;
            padding:10px;
            border:none;
            border-radius:10px;
            background:#27272a;
            color:white;
            cursor:pointer;
        `;

        container.appendChild(button);
    }

    for (const line of lines) {
        const match = line.match(
            /^\s*(?:[-*]\s*)?(?:\*\*)?SECTION\s*:\s*(.+?)(?:\*\*)?\s*$/i
        );

        if (match) {
            // Render the explanation before inserting its navigation button.
            flushMarkdown();
            addSectionButton(match[1]);
        } else {
            markdownBuffer += line + '\n';
        }
    }

    flushMarkdown();

    setTimeout(() => {
        document
            .querySelectorAll('.docsense-jump-btn')
            .forEach(button => {
                button.addEventListener('click', () => {
                    const title = button.dataset.section
                        .toLowerCase()
                        .trim();

                    const exactMatch = window.docsenseData.sections.find(
                        s => s.heading.toLowerCase().trim() === title
                    );

                    const partialMatch = window.docsenseData.sections.find(
                        s => s.heading.toLowerCase().trim().includes(title)
                    );

                    const section = exactMatch || partialMatch;

                    if (section?.element) {
                        section.element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                });
            });
    }, 0);

    // Return the rendered markup for the existing response container.
    return container.innerHTML;

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



                const prompt =
                    buildDocumentationPrompt(
                        sectionData.heading,
                        combinedContent
                    );

                const aiResponse =
                    await askAI(prompt);



                responseElement.innerHTML =
                    renderSafeMarkdown(
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


        button.addEventListener('contextmenu', (event) => {

            event.preventDefault();
            event.stopPropagation();

            const rect = button.getBoundingClientRect();

            const combinedContent =
                sectionData.heading +
                '\n\n' +
                sectionData.content.join('\n\n');

            openCustomPromptDialog(
                rect.right + 8,
                rect.top,
                sectionData.heading,
                combinedContent
            );

        });

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

        button.classList.add('docsense-code-explain-button');
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



                const prompt =
                    buildCodePrompt(
                        codeData.text
                    );

                const aiResponse =
                    await askAI(prompt);



                responseElement.innerHTML =
                    renderSafeMarkdown(
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


        button.addEventListener('contextmenu', (event) => {

            event.preventDefault();
            event.stopPropagation();

            const rect = button.getBoundingClientRect();

            openCustomPromptDialog(
                rect.right + 8,
                rect.top,
                'Code Explanation',
                codeData.text
            );

        });


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

    button.style.top = '70px';

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
        'rgba(139,92,246,0.12)';

    button.style.backdropFilter =
        'blur(8px)';

    button.style.border =
        '1px solid rgba(139,92,246,0.30)';

    button.style.color =
        '#8b5cf6';

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

    selectionButton.style.paddingLeft =
        '3px';

    selectionButton.style.transition =
        'all 0.22s ease';

    selectionButton.style.borderRadius =
        '999px';

    selectionButton.style.background =
        'rgba(139,92,246,0.12)';

    selectionButton.style.border =
        '1px solid rgba(139,92,246,0.30)';

    selectionButton.style.color =
        '#8b5cf6';

    selectionButton.style.boxShadow =
        '0 0 10px rgba(139,92,246,0.18)';

    selectionButton.style.backdropFilter =
        'blur(8px)';

    selectionButton.style.cursor =
        'pointer';

    selectionButton.style.fontFamily =
        'sans-serif';

    const selectionIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24"
             fill="currentColor" aria-hidden="true">
            <path d="M4 2L18 14L11 15L14 22L11 23L8 16L4 18V2Z"/>
        </svg>
    `;

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
                    '1px solid rgba(139,92,246,0.30)';

                selectionButton.style.color =
                    '#8b5cf6';

                selectionButton.style.boxShadow =
                    '0 0 10px rgba(139,92,246,0.18)';

            }

            selectionButton.innerHTML = selectionIcon;
        }
    );

    selectionButton.innerHTML = selectionIcon;

    document.body.appendChild(
        selectionButton
    );

    selectionButton.addEventListener(
        'mouseenter',
        () => {

            selectionButton.innerHTML = `
                ${selectionIcon}
                <span style="margin-left:8px">
                    ${selectionMode ? 'ON' : 'OFF'}
                </span>
            `;

            selectionButton.style.width =
                '70px';

        }
    );

    selectionButton.addEventListener(
        'mouseleave',
        () => {

            selectionButton.innerHTML = selectionIcon;
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
                'rgba(139,92,246,0.12)';

            button.style.border =
                '1px solid rgba(139,92,246,0.30)';

            button.style.color =
                '#8b5cf6';

        }
    );

}

function initializeSelectionMode() {

    document.addEventListener(
        'mouseup',
        (event) => {

            if (
                event.composedPath().some(
                    (target) =>
                        target instanceof Element &&
                        target.matches('.docsense-selection-actions')
                )
            ) {
                return;
            }

            if (!selectionMode) {
                return;
            }

            const selection = window.getSelection();
            const text = selection?.toString() || '';

            if (!text.trim()) {
                return;
            }

            const oldButton =
                document.querySelector(
                    '.docsense-selection-actions'
                );

            if (oldButton) {
                oldButton.remove();
            }

            showSelectionExplainButton(text);

        }
    );

}


function showSelectionExplainButton(selectionText) {

    const oldActions =
        document.querySelector('.docsense-selection-actions');

    if (oldActions) {
        oldActions.remove();
    }

    const selection = window.getSelection();
    const textToUse = selectionText;

    if (!textToUse.trim() || !selection?.rangeCount) {
        return;
    }

    const rect =
        selection.getRangeAt(0).getBoundingClientRect();

    const actions = document.createElement('div');

    actions.className = 'docsense-selection-actions';
    actions.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });
    actions.addEventListener('mouseup', (event) => {
        event.stopPropagation();
    });

    actions.style.cssText = `
        position:fixed;
        left:${Math.max(8, Math.min(
        rect.right + 10,
        window.innerWidth - 220
    ))}px;
        top:${Math.max(8, rect.top - 10)}px;
        z-index:2147483647;
        display:flex;
        align-items:center;
        gap:6px;
        padding:5px;
        border-radius:999px;
        background:#171717;
        border:1px solid #444;
        box-shadow:0 4px 16px rgba(0,0,0,.3);
    `;
    actions.style.setProperty('pointer-events', 'auto', 'important');

    function createActionButton(label, custom = false) {

        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = label;

        button.style.cssText = `
            border:0;
            border-radius:999px;
            padding:9px 13px;
            background:${custom ? '#303030' : '#8b5cf6'};
            color:white;
            font:600 13px sans-serif;
            cursor:pointer;
            white-space:nowrap;
        `;
        button.style.setProperty('pointer-events', 'auto', 'important');

        return button;
    }

    const explainButton = createActionButton('Explain');
    const customButton = createActionButton('Ask', true);
    customButton.title = 'Ask anything about your selected text';

    actions.append(explainButton, customButton);
    document.body.appendChild(actions);

    explainButton.addEventListener('click', async (event) => {

        event.stopPropagation();

        actions.remove();

        createAssistantPopup(
            window.innerWidth - 450,
            120,
            'Selected Text'
        );

        const popup =
            document.querySelector('.docsense-popup');

        const responseElement =
            popup.querySelector('.docsense-response');

        responseElement.innerText = 'Thinking...';

        try {

            const prompt = buildSelectionPrompt(textToUse);
            const aiResponse = await askAI(prompt);

            if (!popup.isConnected) return;

            responseElement.innerHTML =
                renderSafeMarkdown(String(aiResponse));

        } catch (error) {

            console.error('Docsense selection explanation error:', error);

            if (popup.isConnected) {
                responseElement.innerText =
                    'Could not explain the selected text. Please try again.';
            }
        }
    });

    customButton.addEventListener('click', (event) => {

        event.stopPropagation();

        const rect = customButton.getBoundingClientRect();

        actions.remove();

        openCustomPromptDialog(
            rect.left,
            rect.bottom + 8,
            'Selected Text',
            textToUse
        );
    });
}


document.addEventListener(
    'mousedown',
    (event) => {

        const cameFromSelectionActions =
            event.composedPath().some(
                (target) =>
                    target instanceof Element &&
                    target.matches('.docsense-selection-actions')
            );

        if (cameFromSelectionActions) {
            return;
        }

        const actions =
            document.querySelector('.docsense-selection-actions');

        if (actions) {
            actions.remove();
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

        const cameFromSelectionActions =
            event.composedPath().some(
                (target) =>
                    target instanceof Element &&
                    target.matches('.docsense-selection-actions')
            );

        if (cameFromSelectionActions) {
            return;
        }

        if (
            !popup.contains(
                event.target
            ) &&
            popup.dataset.pinned !== 'true'
        ) {
            popup.remove();
        }

    }
);

function addDocsenseResponseStyles() {

    if (document.getElementById('docsense-response-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'docsense-response-styles';

    style.textContent = `
        .docsense-response,
        .docsense-custom-response {
            font-family: -apple-system, BlinkMacSystemFont,
                "Segoe UI", sans-serif;
            font-size: 14px;
            line-height: 1.7;
            color: #e5e7eb;
            overflow-wrap: anywhere;
        }

        .docsense-response h1,
        .docsense-response h2,
        .docsense-response h3,
        .docsense-custom-response h1,
        .docsense-custom-response h2,
        .docsense-custom-response h3 {
            color: #ffffff;
            line-height: 1.35;
            font-weight: 650;
            margin: 20px 0 10px;
        }

        .docsense-response h1,
        .docsense-custom-response h1 {
            font-size: 21px;
        }

        .docsense-response h2,
        .docsense-custom-response h2 {
            font-size: 18px;
        }

        .docsense-response h3,
        .docsense-custom-response h3 {
            font-size: 15px;
        }

        .docsense-response h1:first-child,
        .docsense-response h2:first-child,
        .docsense-response h3:first-child,
        .docsense-custom-response h1:first-child,
        .docsense-custom-response h2:first-child,
        .docsense-custom-response h3:first-child {
            margin-top: 0;
        }

        .docsense-response p,
        .docsense-custom-response p {
            margin: 0 0 12px;
        }

        .docsense-response ul,
        .docsense-response ol,
        .docsense-custom-response ul,
        .docsense-custom-response ol {
            padding-left: 24px;
            margin: 8px 0 16px;
        }

        .docsense-response li,
        .docsense-custom-response li {
            margin-bottom: 6px;
        }

        .docsense-response strong,
        .docsense-custom-response strong {
            color: #ffffff;
            font-weight: 650;
        }

        .docsense-response pre,
        .docsense-custom-response pre {
            overflow-x: auto;
            max-width: 100%;
            box-sizing: border-box;
            padding: 14px;
            margin: 12px 0 16px;
            border: 1px solid #374151;
            border-radius: 10px;
            background: #0b0f19;
            line-height: 1.6;
        }

        .docsense-response pre code,
        .docsense-custom-response pre code {
            padding: 0;
            background: transparent;
            color: #e5e7eb;
            font-family: Consolas, "Courier New", monospace;
            font-size: 13px;
        }

        .docsense-response :not(pre) > code,
        .docsense-custom-response :not(pre) > code {
            padding: 2px 5px;
            border-radius: 4px;
            background: #30303a;
            color: #c4b5fd;
            font-family: Consolas, "Courier New", monospace;
            font-size: 0.9em;
        }

        .docsense-response blockquote,
        .docsense-custom-response blockquote {
            margin: 12px 0;
            padding: 10px 14px;
            border-left: 3px solid #8b5cf6;
            border-radius: 4px;
            background: #20202a;
        }

        .docsense-response blockquote p,
        .docsense-custom-response blockquote p {
            margin-bottom: 0;
        }

        .docsense-response table,
        .docsense-custom-response table {
            display: block;
            max-width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
            margin: 12px 0 16px;
        }

        .docsense-response th,
        .docsense-response td,
        .docsense-custom-response th,
        .docsense-custom-response td {
            padding: 8px 10px;
            border: 1px solid #374151;
            text-align: left;
        }

        .docsense-response th,
        .docsense-custom-response th {
            background: #27272a;
            color: #ffffff;
        }

        .docsense-response hr,
        .docsense-custom-response hr {
            border: 0;
            border-top: 1px solid #383838;
            margin: 18px 0;
        }

        .docsense-response a,
        .docsense-custom-response a {
            color: #c4b5fd;
            text-decoration: underline;
            overflow-wrap: anywhere;
        }
    `;

    (document.head || document.documentElement).appendChild(style);
}

function applyCheatMode() {
    let style = document.getElementById('docsense-cheat-mode-style');

    if (!style) {
        style = document.createElement('style');
        style.id = 'docsense-cheat-mode-style';
        (document.head || document.documentElement).appendChild(style);
    }

    style.textContent = cheatModeEnabled ? `
        .docsense-heading-button,
        .docsense-floating-search,
        .docsense-selection-toggle,
        .docsense-selection-actions,
        .docsense-code-wrapper .docsense-code-explain-button {
            display: none !important;
        }
    ` : '';

    if (cheatModeEnabled) {
        document.querySelectorAll(
            '.docsense-selection-actions'
        ).forEach(element => element.remove());
    }
}

document.addEventListener('mouseup', (event) => {
    if (!cheatModeEnabled) return;

    // Ignore selections made inside DocSenseAI UI.
    if (event.target instanceof Element &&
        event.target.closest('#docsense-answer-dot, #docsense-inline-answer')) {
        return;
    }

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    document.getElementById('docsense-answer-dot')?.remove();

    if (!selectedText || !selection?.rangeCount) return;

    const rect = selection.getRangeAt(0).getBoundingClientRect();

    if (!rect.width && !rect.height) return;

    // Create a small dot beside the selected text.
    const dot = document.createElement('button');
    dot.id = 'docsense-answer-dot';
    dot.type = 'button';
    dot.title = 'Get a concise AI response';
    dot.setAttribute('aria-label', 'Get AI response');

    dot.style.cssText = `
        position: fixed;
        left: ${Math.max(8, Math.min(rect.right + 6, window.innerWidth - 16))}px;
        top: ${Math.max(8, Math.min(rect.top, window.innerHeight - 16))}px;
        width: 8px;
        height: 8px;
        min-width: 8px;
        min-height: 8px;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 50%;
        background: #8b5cf6;
        box-shadow: none;
        outline: none;
        appearance: none;
        cursor: pointer;
        z-index: 2147483647;
    `;

    document.body.appendChild(dot);

    // Keep the selected text and position even after clicking the dot.
    const textToExplain = selectedText;
    const answerLeft = Math.max(12, window.innerWidth - 432);
    const answerTop = 24;

    dot.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    dot.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        dot.remove();
        document.getElementById('docsense-inline-answer')?.remove();

        const answer = document.createElement('div');
        answer.id = 'docsense-inline-answer';

        answer.style.cssText = `
            position: fixed;
            left: ${answerLeft}px;
            top: ${answerTop}px;
            width: max-content;
            max-width: min(420px, calc(100vw - 24px));
            max-height: 45vh;
            overflow-y: auto;
            z-index: 2147483647;
            color: inherit;
            background: transparent;
            border: none;
            box-shadow: none;
            padding: 0;
            margin: 0;
            font: 14px/1.6 sans-serif;
            white-space: normal;
        `;

        answer.innerHTML = `
            <span style="display:inline-flex;gap:4px;align-items:center">
                <span class="docsense-dot">.</span>
                <span class="docsense-dot">.</span>
                <span class="docsense-dot">.</span>
            </span>
        `;

        if (!document.getElementById('docsense-dot-style')) {
            const style = document.createElement('style');
            style.id = 'docsense-dot-style';
            style.textContent = `
                @keyframes docsense-dot-pulse {
                    0%, 60%, 100% { opacity: .25; }
                    30% { opacity: 1; }
                }
                .docsense-dot {
                    font-size: 22px;
                    animation: docsense-dot-pulse 1.2s infinite;
                }
                .docsense-dot:nth-child(2) { animation-delay: .2s; }
                .docsense-dot:nth-child(3) { animation-delay: .4s; }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(answer);

        // Close only when clicking outside the answer.
        const closeOnOutsideClick = (clickEvent) => {
            if (
                answer.isConnected &&
                !answer.contains(clickEvent.target)
            ) {
                answer.remove();
                document.removeEventListener(
                    'click',
                    closeOnOutsideClick,
                    true
                );
            }
        };

        // Register after this click finishes.
        setTimeout(() => {
            if (answer.isConnected) {
                document.addEventListener(
                    'click',
                    closeOnOutsideClick,
                    true
                );
            }
        }, 0);

        const prompt = `
Answer directly and concisely.
Avoid introductions and unnecessary explanation.
If an explanation is needed, keep it brief.

Selected text:
${textToExplain}
`;

        try {
            const response = await askAI(prompt);

            if (answer.isConnected) {
                answer.innerHTML = renderSafeMarkdown(String(response));
            }
        } catch (error) {
            console.error('[DocSenseAI] Request failed:', error);

            if (answer.isConnected) {
                answer.textContent = 'Could not get a response. Please try again.';
            }
        }
    });
});

function initializeDocsense() {

    addDocsenseResponseStyles();

    const extractedData = extractPageData();

    window.docsenseData = extractedData;

    if (extractedData) {

        injectHeadingButtons(extractedData.sections);

        injectCodeButtons(extractedData.codeBlocks);

        injectFloatingSearchButton();

        initializeSelectionMode();

    }

}

initializeDocsense();
})();