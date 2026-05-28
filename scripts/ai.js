async function askGemini(prompt, apiKey, model = 'gemini-2.5-flash') {

    try {

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
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

        const data = await response.json();

        console.log('GEMINI RESPONSE:', data);

        return data;

    } catch (error) {

        console.error('Gemini API Error:', error);

        return {
            error: {
                message: error.message
            }
        };

    }

}