importScripts('./ai.js');


chrome.runtime.onMessage.addListener(

    async (message, sender, sendResponse) => {

        // =========================
        // GEMINI REQUEST
        // =========================

        if (
            message.type === 'ASK_GEMINI'
        ) {

            try {

                const aiResponse =

                    await askGemini(

                        message.prompt,

                        message.apiKey

                    );



                sendResponse(aiResponse);

            }

            catch (error) {

                console.error(
                    'Background Error:',
                    error
                );



                sendResponse({

                    error: error.message

                });

            }

        }



        // IMPORTANT
        return true;

    }

);