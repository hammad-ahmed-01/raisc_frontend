export default function ChatMessage({ role, content }: { role: string; content: string }) {
    return (
        <div className={`p-2 rounded my-1 ${role === 'user' ? 'text-right' : 'text-left'}`}>
            <p className={`inline-block px-4 py-2 rounded ${role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {content}
            </p>
        </div>
    );
}
