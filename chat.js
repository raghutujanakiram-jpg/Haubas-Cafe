module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, systemPrompt } = req.body;
    
    // Security: The OpenAI API Key is securely injected by Vercel Environment Variables!
    // NEVER put your API keys in the frontend HTML.
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API Key is not configured in Vercel Environment Variables.' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Fast, cheap, and highly capable
                messages: [
                    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                    { role: 'user', content: message }
                ],
                max_tokens: 150
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices.length > 0) {
            res.status(200).json({ reply: data.choices[0].message.content });
        } else {
            res.status(500).json({ error: 'AI failed to generate a valid response.' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
