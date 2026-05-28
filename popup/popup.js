const apiKeyInput =document.getElementById('apiKeyInput');

const saveButton =document.getElementById('saveButton');

const statusText =document.getElementById('statusText');


chrome.storage.local.get(
    ['geminiApiKey'],
    (result) => {

        if (result.geminiApiKey) {

            apiKeyInput.value =
                result.geminiApiKey;

        }

    }
);



// =========================
// SAVE API KEY
// =========================

saveButton.addEventListener(
    'click',
    () => {

        const apiKey =
            apiKeyInput.value.trim();



        if (!apiKey) {

            statusText.innerText =
                'Please enter API key';

            return;

        }



        chrome.storage.local.set(

            {

                geminiApiKey: apiKey

            },

            () => {

                statusText.innerText =
                    'API Key Saved';
                    console.log('API Key saved:', apiKey);

            }

        );

    }
);

const activateButton =
    document.getElementById(
        'activateButton'
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

                'scripts/content.js'

            ]

        });
        statusText.innerText = 'Docsense activated on page';

    }

);