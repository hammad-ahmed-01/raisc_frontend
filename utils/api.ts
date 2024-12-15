export async function fetchChatResponse(sessionKey: string, message: string): Promise<string> {
    const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_key: sessionKey,
            message: message,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
    }

    const data = await response.json();
    return data.response;
}
