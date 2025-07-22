"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Message {
    type: string;
    message: string;
    question_id?: number;
}

export default function GroupChatPage() {
    const { group_id } = useParams();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [loading, setLoading] = useState(true); // Loading state for WebSocket
    const socket = useRef<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("session_key");

        const baseURL = `ws://127.0.0.1:8000/ws/chat/${group_id}/`;
        const socketURL = token ? `${baseURL}?token=${token}` : baseURL;

        console.log("Connecting to WebSocket:", socketURL);
        socket.current = new WebSocket(socketURL);

        socket.current.onopen = () => {
            console.log("WebSocket connected.");
            setLoading(false); // Connection established
        };

        socket.current.onclose = () => {
            console.log("WebSocket disconnected.");
            setLoading(true); // Set loading state for reconnection
        };

        socket.current.onerror = () => {
            console.log("WebSocket connection is in progress. Please wait...");
        };

        socket.current.onmessage = (event) => {
            const data: Message = JSON.parse(event.data);

            if (data.type === "question") {
                setMessages((prev) => [...prev, data]);
            }
        };

        return () => {
            console.log("Closing WebSocket...");
            socket.current?.close();
        };
    }, [group_id]);

    const sendQuestion = () => {
        if (newQuestion.trim() && socket.current?.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({ type: "question", message: newQuestion });
            console.log("Sending message:", payload);
            socket.current.send(payload);
            setNewQuestion("");
        } else {
            console.log("WebSocket is not ready to send messages.");
        }
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <p>Connecting to chat...</p>
            </div>
        );
    }

    return (
        <div className="chat-container">
            <h1>Group {group_id} - Questions</h1>
            <div className="chat-box">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className="chat-message chat-question"
                        onClick={() =>
                            router.push(`/groups/${group_id}/${msg.question_id}`)
                        }
                    >
                        {msg.message}
                    </div>
                ))}
            </div>
            <div className="input-section">
                <input
                    type="text"
                    placeholder="Ask a question..."
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                />
                <button onClick={sendQuestion}>Send</button>
            </div>
        </div>
    );
}
