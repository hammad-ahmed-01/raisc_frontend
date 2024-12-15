import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-gray-800 text-white p-4">
            <ul className="flex gap-4">
                <li>
                    <Link href="/patient/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link href="/patient/chat">Chat</Link>
                </li>
            </ul>
        </nav>
    );
}
