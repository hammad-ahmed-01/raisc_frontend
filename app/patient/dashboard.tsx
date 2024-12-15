import Link from 'next/link';
import GreetingCard from '@/components/GreetingCard';
import Navbar from '@/components/Navbar';

export default function PatientDashboard() {
    return (
        <div className="container mx-auto p-4">
            <Navbar />
            <GreetingCard message="Welcome back! Ready to chat with your bot?" />
            <div className="flex gap-4 mt-4">
                <Link href="/patient/chat">
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Chat with Bot
                    </button>
                </Link>
                <Link href="/calendar">
                    <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                        View Calendar
                    </button>
                </Link>
            </div>
        </div>
    );
}
