import { User } from "@/src/types";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewPatientDashboard({ user }: { user: User }) {
    const router = useRouter();

    return (
        <div className="mt-6 p-10 bg-gradient-to-br from-blue-100 to-teal-100 border border-blue-300 rounded-lg text-center shadow-2xl">
            {/* Illustration */}
            <div className="flex justify-center mb-6">
                <Image 
                    src="/mental-health-illustration.jpg" 
                    alt="Mental Health Illustration" 
                    width={350} 
                    height={250} 
                    className="rounded-lg"
                />
            </div>

            {/* Title */}
            <h2 className="text-4xl font-bold text-blue-800">Welcome to Your Journey 🚀</h2>
            <p className="text-lg text-gray-800 mt-3 leading-relaxed">
                You’re taking the first step towards 
                <span className="font-bold text-blue-700"> mental wellness.</span><br />
                Our AI assistant is here to 
                <span className="font-bold text-blue-700"> guide and support you</span><br />
                every step of the way.
            </p>

            {/* Motivational Message */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-blue-200">
                <p className="text-xl font-semibold text-blue-700">
                    "Healing begins with a single step, and you are never alone on this journey." 🌿
                </p>
            </div>

            {/* Animated Chat Option */}
            <div className="mt-10 flex flex-col items-center">
                <p className="text-lg text-gray-800 font-medium mb-3">
                    Start your first conversation and take a step towards clarity.
                </p>
                <button
                    onClick={() => router.push("/chat")}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-full shadow-lg transition transform hover:scale-105 flex items-center"
                >
                    Start Chatting
                    <span className="ml-3 animate-bounce">💬</span>
                </button>
            </div>

            {/* Additional Encouragement */}
            <div className="mt-8 text-gray-700">
                <p className="text-lg font-medium">💡 <span className="text-blue-700 font-semibold">Did you know?</span></p>
                <p className="text-md mt-2">
                    <span className="font-bold text-blue-700">90% of people</span> feel  
                    <span className="font-bold text-blue-700"> better</span> after expressing their thoughts.  
                    <br />
                    <span className="font-bold text-blue-700">Let's talk. We are here for you. 💙</span>
                </p>
            </div>
        </div>
    );
}
