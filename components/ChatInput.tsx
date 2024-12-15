import { useState } from 'react';

export default function ChatInput({ onSend }: { onSend: (message: string) => void }) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    return (
        <div className="flex p-4 bg-white">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded"
            />
            <button onClick={handleSend} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded">
                Send
            </button>
        </div>
    );
}
