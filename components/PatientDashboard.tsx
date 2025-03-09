import { User } from "@/src/types";
import { useRouter } from "next/navigation";

export default function PatientDashboard({ user }: { user: User }) {
    const router = useRouter();

    return (
        <div className="mt-6 p-6 bg-blue-100 border border-blue-300 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-blue-800">Patient Dashboard</h2>
            <p className="text-gray-700">
                <span className="font-semibold">Level:</span> {user.patient_profile?.level}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold">Associated Psychologist:</span>{" "}
                {user.patient_profile?.associated_psychologist || "None"}
            </p>
            <button
                onClick={() => router.push("/chat")}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md transition"
            >
                Chat with Bot
            </button>
        </div>
    );
}
