import { User } from "@/src/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ReturningPatientDashboard({ user }: { user: User }) {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-teal-100 px-4 py-12">
            {/* Welcome Back Section */}
            <div className="w-full max-w-3xl flex flex-col items-center text-center">
                <Image
                    src="/welcome-back.jpg"
                    alt="Welcome Back Illustration"
                    width={350}
                    height={250}
                    className="rounded-xl shadow-xl"
                />
                <h2 className="text-4xl md:text-5xl font-extrabold text-blue-800 mt-6">
                    Welcome Back, {user.username}! 🌿
                </h2>
                <p className="text-lg md:text-xl text-gray-700 mt-4 leading-relaxed max-w-2xl">
                    We're thrilled to see you again. Your personal journey continues, and we’re here to guide you every step of the way.
                </p>
            </div>

            {/* Chatbot Section */}
            <div className="mt-12 flex flex-col items-center w-full">
                <p className="text-lg md:text-xl text-gray-800 font-medium mb-4">
                    Ready to continue your conversation?
                </p>
                <button
                    onClick={() => router.push("/chat")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg md:text-xl px-10 py-4 rounded-full shadow-lg transition transform hover:scale-110 flex items-center"
                >
                    Resume Chat
                    <span className="ml-3 animate-bounce">💬</span>
                </button>
            </div>

            {/* Encouragement Section */}
            <div className="mt-12 w-full max-w-lg p-6 bg-white rounded-xl shadow-lg border border-blue-200 text-center">
                <p className="text-lg md:text-xl font-semibold text-blue-700">
                    "Progress is made step by step. Every conversation brings you closer to your goals." 🌿
                </p>
            </div>

            {/* Soft Guidance to Get a Psychologist */}
            <div className="mt-10 text-center w-full max-w-2xl">
                <p className="text-lg font-medium text-gray-700">
                    💡 <span className="text-blue-700 font-semibold">Thinking about talking to a professional?</span>
                </p>
                <p className="text-md md:text-lg mt-3 text-gray-700">
                    When you’re ready, we can help match you with a
                    <span className="font-bold text-blue-700"> licensed psychologist</span> who can provide tailored guidance and care.
                </p>
                <button
                    onClick={() => router.push("/view-professionals")}
                    className="mt-5 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg transition transform hover:scale-110"
                >
                    Learn More
                </button>
            </div>
        </div>
    );
}