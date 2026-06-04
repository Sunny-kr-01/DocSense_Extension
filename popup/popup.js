const apiKeyInput =
    document.getElementById(
        'apiKeyInput'
    );

const saveButton =
    document.getElementById(
        'saveButton'
    );

const activateButton =
    document.getElementById(
        'activateButton'
    );

const getApiKeyButton =
    document.getElementById(
        'getApiKeyButton'
    );

const statusText =
    document.getElementById(
        'statusText'
    );

chrome.storage.local.get(

    ['geminiApiKey'],

    (result) => {

        if (result.geminiApiKey) {

            apiKeyInput.value =
                result.geminiApiKey;

        }

    }

);

getApiKeyButton.addEventListener(

    'click',

    () => {

        chrome.tabs.create({

            url:
                'https://aistudio.google.com/app/apikey'

        });

    }

);

saveButton.addEventListener(

    'click',

    () => {

        const apiKey =
            apiKeyInput.value.trim();

        if (!apiKey) {

            statusText.innerText =
                'Please enter an API key';

            return;

        }

        chrome.storage.local.set(

            {

                geminiApiKey:
                    apiKey

            },

            () => {

                statusText.innerText =
                    'Gemini API Key Saved';

            }

        );

    }

);

activateButton.addEventListener(

    'click',

    async () => {

        const [tab] =

            await chrome.tabs.query({

                active: true,

                currentWindow: true

            });

        chrome.scripting.executeScript({

            target: {

                tabId: tab.id

            },

            files: [

                'libs/marked.min.js',
                'scripts/content.js'

            ]

        });

        statusText.innerText =
            'Docsense activated on page';

    }

);