"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Message {
    type: string;
    message: string;
    question_id?: number;
    error?: string;
}

export default function QuestionChatPage() {
    const { group_id, question_id } = useParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newAnswer, setNewAnswer] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); // Track WebSocket connection state
    const [disconnected, setDisconnected] = useState(false); // Track disconnection state
    const [question, setQuestion] = useState<string>(""); // Store the question text
    const socket = useRef<WebSocket | null>(null);
    const [isDoctor, setIsDoctor] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("session_key");

        const baseURL = `ws://127.0.0.1:8000/ws/chat/${group_id}/`;
        const socketURL = token ? `${baseURL}?token=${token}` : baseURL;

        console.log("Connecting to WebSocket:", socketURL);
        socket.current = new WebSocket(socketURL);

        socket.current.onopen = () => {
            console.log("WebSocket connected.");
            setLoading(false); // Connection established
            setDisconnected(false); // Clear disconnection state
        };

        socket.current.onclose = () => {
            console.log("WebSocket disconnected.");
            setDisconnected(true); // Show disconnection state
            setLoading(false); // Stop loading state
        };

        socket.current.onerror = () => {
            console.log("WebSocket connection is in progress. Please wait...");
        };

        socket.current.onmessage = (event) => {
            const data: Message = JSON.parse(event.data);
            console.log("Message received:", data);

            if (data.error) {
                setErrorMessage(data.error); // Display error
            } else if (data.type === "question" && data.question_id === Number(question_id)) {
                setQuestion(data.message); // Display the question as heading
                setErrorMessage(null);
            } else if (data.type === "answer" && data.question_id === Number(question_id)) {
                setMessages((prev) => [...prev, data]);
                setErrorMessage(null); // Clear previous errors
            }
        };

        if (token) setIsDoctor(true);

        return () => {
            console.log("Closing WebSocket...");
            socket.current?.close();
        };
    }, [group_id, question_id]);

    const sendAnswer = () => {
        if (newAnswer.trim() && socket.current?.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({
                type: "answer",
                message: newAnswer,
                question_id: Number(question_id),
            });
            console.log("Sending message:", payload);
            socket.current.send(payload);
            setNewAnswer("");
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
            <div className="question-header">
                <h2>{question || "Loading question..."}</h2>
            </div>
            <div className="chat-box">
                {messages.map((msg, idx) => (
                    <div key={idx} className="chat-message chat-answer">
                        {msg.message}
                    </div>
                ))}
            </div>
            {errorMessage && (
                <div className="error-message">
                    <p>{errorMessage}</p>
                </div>
            )}
            {isDoctor && (
                <div className="input-section">
                    <input
                        type="text"
                        placeholder="Type your answer..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                    />
                    <button onClick={sendAnswer}>Send</button>
                </div>
            )}
        </div>
    );
}
