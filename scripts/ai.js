async function askGemini(
    prompt,
    apiKey,
    model = 'gemini-2.5-flash'
) {

    const makeRequest = async () => {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        return await response.json();

    };

    try {

        const data =
            await makeRequest();

        

        const errorMessage =
            data?.error?.message
                ?.toLowerCase() || '';

        const shouldRetry =

            errorMessage.includes('503') ||

            errorMessage.includes('busy') ||

            errorMessage.includes('overloaded') ||

            errorMessage.includes('unavailable');

        if (shouldRetry) {

            

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        3000
                    )
            );

            const retryData =
                await makeRequest();

            

            return retryData;

        }

        return data;

    }

    catch (error) {

        console.error(
            'Gemini API Error:',
            error
        );

        return {
            error: {
                message:
                    error.message
            }
        };

    }

}