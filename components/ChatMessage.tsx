interface ChatMessageProps {
    role: string;
    content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
    return (
        <div style={{ margin: "5px 0" }}>
            <strong>{role === "user" ? "You: " : "Bot: "}</strong> {content}
        </div>
    );
}
