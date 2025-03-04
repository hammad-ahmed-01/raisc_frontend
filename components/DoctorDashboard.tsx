import { User } from "@/src/types";

export default function DoctorDashboard({ user }: { user: User }) {
    return (
        <div className="mt-6 p-6 bg-green-100 border border-green-300 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-semibold text-green-800">Doctor Dashboard</h2>
            <p className="text-gray-700 mt-2">
                <span className="font-semibold">Qualification:</span> {user.doctor_profile?.professional_information.qualification}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold">Nickname:</span> {user.doctor_profile?.chatgroup_nickname}
            </p>
            <p className="text-gray-700">
                <span className="font-semibold">Rates:</span> ${user.doctor_profile?.rates}
            </p>
        </div>
    );
}
