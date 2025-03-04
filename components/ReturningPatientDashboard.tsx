import { User } from "@/src/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReturningPatientDashboard({ user }: { user: User }) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-teal-100">
            {/* Welcome Back Section */}
            <div className="w-full flex flex-col items-center text-center px-6 mt-12">
                <Image 
                    src="/welcome-back.jpg" 
                    alt="Welcome Back Illustration" 
                    width={350} 
                    height={250} 
                    className="rounded-lg shadow-lg"
                />
                <h2 className="text-4xl font-bold text-blue-800 mt-6">
                    Welcome Back, {user.username}! 🌿
                </h2>
                <p className="text-xl text-gray-800 mt-3 leading-relaxed max-w-2xl">
                    It's great to have you here again. Your journey continues, and we're here to support you every step of the way.
                </p>
            </div>

            {/* Chatbot Section */}
            <div className="mt-10 flex flex-col items-center w-full">
                <p className="text-lg text-gray-800 font-medium mb-3">
                    Continue your journey with a conversation.
                </p>
                <button
                    onClick={() => router.push("/chat")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-10 py-4 rounded-full shadow-lg transition transform hover:scale-105 flex items-center"
                >
                    Resume Chat
                    <span className="ml-3 animate-bounce">💬</span>
                </button>
            </div>

            {/* Encouragement Section */}
            <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-blue-200 max-w-lg text-center">
                <p className="text-xl font-semibold text-blue-700">
                    "Progress is made step by step. Every conversation helps you move forward." 🌿
                </p>
            </div>

            {/* Soft Guidance to Get a Psychologist */}
            <div className="mt-10 text-gray-700 text-center px-6">
                <p className="text-lg font-medium">💡 <span className="text-blue-700 font-semibold">Thinking about speaking with a professional?</span></p>
                <p className="text-lg mt-2 max-w-2xl">
                    When you're ready, we can help match you with a 
                    <span className="font-bold text-blue-700"> professional psychologist</span> who can guide you further. 
                </p>
                <button
                    className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg transition transform hover:scale-105"
                >
                    Learn More
                </button>
            </div>
            <br />
        </div>
    );
}
