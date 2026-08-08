const apiKeyInput =
    document.getElementById(
        'apiKeyInput'
    );

const modelSelect =
    document.getElementById(
        'modelSelect'
    );

const customModelInput =
    document.getElementById(
        'customModelInput'
    );

modelSelect.addEventListener(
    'change',
    () => {

        if (modelSelect.value === 'custom') {

            customModelInput.style.display =
                'block';

            customModelInput.focus();

        } else {

            customModelInput.style.display =
                'none';

            customModelInput.value = '';

        }

    }
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

    ['geminiApiKey', 'geminiModel'],

    (result) => {

        if (result.geminiApiKey) {

            apiKeyInput.value =
                result.geminiApiKey;

        }
        if (result.geminiModel) {

            const exists =
                [...modelSelect.options]
                    .some(
                        option =>
                            option.value === result.geminiModel
                    );


            if (exists) {

                modelSelect.value =
                    result.geminiModel;

            } else {

                modelSelect.value =
                    'custom';

                customModelInput.value =
                    result.geminiModel;

                customModelInput.style.display =
                    'block';

            }

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

        const selectedModel =
            modelSelect.value === 'custom'
                ? customModelInput.value.trim()
                : modelSelect.value;

        if (!selectedModel) {

            statusText.innerText =
                'Please enter a custom model name';

            return;
        }

        chrome.storage.local.set(

            {

                geminiApiKey:
                    apiKey,
                geminiModel:
                    selectedModel

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

        try {

            const [tab] =
                await chrome.tabs.query({

                    active: true,

                    currentWindow: true

                });

            await chrome.scripting.executeScript({

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

        } catch (error) {

            console.error(
                'Docsense activation failed:',
                error
            );

            statusText.innerText =
                'Could not activate Docsense on this page.';

        }

    }
);