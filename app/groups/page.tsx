"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Group {
    id: number;
    name: string;
    description: string;
}

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/chat/groups/`)
            .then((res) => res.json())
            .then(setGroups);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 flex flex-col items-center py-12 px-6">
            <h1 className="text-4xl font-bold text-blue-700 mb-8 mt-8">Available Groups</h1>
            {groups.length === 0 ? (
                <p className="text-gray-600 text-lg">Loading groups...</p>
            ) : (
                <ul className="w-full max-w-3xl grid gap-6">
                    {groups.map((group) => (
                        <li key={group.id}>
                            <button
                                onClick={() => router.push(`/groups/${group.id}`)}
                                className="w-full text-left bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-105"
                            >
                                <h2 className="text-2xl font-semibold text-blue-600 mb-2">
                                    {group.name}
                                </h2>
                                <p className="text-gray-700">{group.description}</p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}