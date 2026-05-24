function extractHeadings() {
  const headings = document.querySelectorAll('h1, h2');

  const headingData = [];

  headings.forEach((heading, index) => {
    const text = heading.textContent.trim();

    if (!text) return;

    headingData.push({
      id: index + 1,
      type: "heading",
      level: heading.tagName,
      text: text,
      element: heading
    });
  });

  return headingData;
}

function extractLists() {
  const lists = document.querySelectorAll('ul, ol');

  const listData = [];

  lists.forEach((list, index) => {

    const items = [];

    list.querySelectorAll('li').forEach((item) => {

      const text = item.textContent.trim();

      if (text) {
        items.push(text);
      }
    });

    if (items.length === 0) return;

    listData.push({
      id: index + 1,
      type: "list",
      listType: list.tagName,
      items: items,
      element: list
    });
  });

  return listData;
}

function extractParagraphs() {
  const paragraphs = document.querySelectorAll('p');

  const paragraphData = [];

  paragraphs.forEach((paragraph, index) => {

    const text = paragraph.textContent.trim();

    if (!text) return;

    paragraphData.push({
      id: index + 1,
      type: "paragraph",
      text: text,
      element: paragraph
    });
  });

  return paragraphData;
}

function extractCodeBlocks() {

  const selectors = [
    // Generic HTML code blocks
    'pre',
    'code',

    // Generic class patterns
    '[class*="code"]',
    '[class*="highlight"]',
    '[class*="language"]',
    '[class*="source"]',

    // MDN
    'mdn-code-example',

    // GitHub markdown/code highlighting
    '.highlight',
    '.highlight-source-js',
    '.highlight-source-ts',
    '.highlight-source-python',
    '.highlight-source-shell',

    // Prism.js / syntax highlighters
    '.language-js',
    '.language-javascript',
    '.language-ts',
    '.language-python',

    // Common docs wrappers
    '.code-example',
    '.codeBlock',
    '.code-block'
  ];

  const codeElements = document.querySelectorAll(selectors.join(','));

  const seen = new Set();

  const codeData = [];

  codeElements.forEach((block, index) => {

    const text = block.textContent.trim();

    if (!text) return;

    if (seen.has(text)) return;

    seen.add(text);

    codeData.push({
      id: index + 1,
      type: "code",
      text: text,
      element: block
    });
  });

  return codeData;
}

function extractPageData() {

  const pageData = {
    url: window.location.href,
    title: document.title,

    headings: extractHeadings(),
    lists: extractLists(),
    paragraphs: extractParagraphs(),
    codeBlocks: extractCodeBlocks()
  };

  return pageData;
}

// ==============================
// GET MAIN ARTICLE CONTAINER
// ==============================

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



// ==============================
// EXTRACT HEADINGS
// ==============================

function extractHeadings(root) {

    const headings = root.querySelectorAll('h1, h2, h3');

    const headingData = [];

    headings.forEach((heading, index) => {

        const text = heading.textContent.trim();

        // ignore empty headings
        if (!text) return;

        headingData.push({
            id: index,
            text: text,
            level: heading.tagName,
            element: heading
        });

    });

    return headingData;

}



// ==============================
// EXTRACT CODE BLOCKS
// ==============================

function extractCodeBlocks(root) {

    const codeSelectors = [
        'pre',
        'pre code',
        '.highlight',
        '.highlight-source-js',
        '.mdn-code-example',
        'code[class*="language-"]'
    ];

    const codeBlocks = root.querySelectorAll(codeSelectors.join(','));

    const codeData = [];

    codeBlocks.forEach((block, index) => {

        const text = block.textContent.trim();

        if (!text) return;

        codeData.push({
            id: index,
            text: text,
            element: block
        });

    });

    return codeData;

}



// ==============================
// EXTRACT PAGE DATA
// ==============================

function extractPageData() {

    const root = getArticleRoot();

    if (!root) {

        console.log('No article root found');

        return null;

    }

    return {

        url: window.location.href,

        title: document.title,

        headings: extractHeadings(root),

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

    const popup = document.createElement('div');

    popup.classList.add('docsense-popup');



    // =========================
    // POPUP STYLES
    // =========================

    popup.style.position = 'absolute';

    popup.style.top = `${y + window.scrollY}px`;

popup.style.left = `${x + window.scrollX}px`;

    popup.style.width = '260px';

    popup.style.padding = '14px';

    popup.style.borderRadius = '14px';

    popup.style.background = 'rgba(20,20,20,0.92)';

    popup.style.backdropFilter = 'blur(12px)';

    popup.style.color = 'white';

    popup.style.fontSize = '14px';

    popup.style.lineHeight = '1.5';

    popup.style.zIndex = '999999';

    popup.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';

    popup.style.border = '1px solid rgba(255,255,255,0.08)';

    popup.style.fontFamily = 'sans-serif';



    // =========================
    // POPUP CONTENT
    // =========================

    popup.innerHTML = `
    
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:10px;
        ">

            <div style="
                font-weight:600;
                font-size:15px;
            ">
                Docsense AI
            </div>

            <div class="docsense-close-btn" style="
                cursor:pointer;
                opacity:0.7;
                font-size:18px;
            ">
                ×
            </div>

        </div>


        <div style="
            font-size:15px;
            font-weight:600;
            margin-bottom:8px;
        ">
            ${headingText}
        </div>


        <div style="
            opacity:0.82;
            margin-bottom:14px;
        ">
            This section explains concepts related to 
            "${headingText}".
        </div>


        <button class="docsense-open-sidebar" style="
            width:100%;
            padding:10px;
            border:none;
            border-radius:10px;
            cursor:pointer;
            background:#8b5cf6;
            color:white;
            font-weight:600;
        ">
            Open Full Assistant
        </button>

    `;



    // =========================
    // CLOSE BUTTON
    // =========================

    popup
        .querySelector('.docsense-close-btn')
        .addEventListener('click', () => {

            popup.remove();

        });



    // =========================
    // SIDEBAR BUTTON
    // =========================

    popup
        .querySelector('.docsense-open-sidebar')
        .addEventListener('click', () => {

            console.log('OPEN SIDEBAR');

        });



    document.body.appendChild(popup);

}



function injectHeadingButtons(headings) {

    headings.forEach((headingData) => {

        const headingElement = headingData.element;



        // prevent duplicate injection
        if (
            headingElement.querySelector('.docsense-heading-button')
        ) {
            return;
        }



        const button = document.createElement('img');

        button.classList.add('docsense-heading-button');



        styleInjectedButton(button);



        // =========================
        // CLICK EVENT
        // =========================

        button.addEventListener('click', (event) => {

            event.stopPropagation();



            const rect = button.getBoundingClientRect();



            createAssistantPopup(

                rect.right + 12,

                rect.top + 4,

                headingData.text

            );

        });



        headingElement.appendChild(button);

    });

}



// =========================
// CLOSE POPUP ON OUTSIDE CLICK
// =========================

document.addEventListener('click', (event) => {

    const popup = document.querySelector('.docsense-popup');

    if (!popup) return;

    if (!popup.contains(event.target)) {

        popup.remove();

    }

});

const extractedData = extractPageData();

console.log('EXTRACTED DATA');

console.log(extractedData);

if (extractedData) {

    injectHeadingButtons(extractedData.headings);

}