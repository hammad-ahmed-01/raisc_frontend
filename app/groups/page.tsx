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
        fetch("http://127.0.0.1:8000/chat/groups/")
            .then((res) => res.json())
            .then(setGroups);
    }, []);

    return (
        <div className="groups-container">
            <h1 className="groups-header">Available Groups</h1>
            <ul className="group-list">
                {groups.map((group) => (
                    <li key={group.id} className="group-item-container">
                        <button
                            onClick={() => router.push(`/groups/${group.id}`)}
                            className="group-item"
                        >
                            <span className="group-name">{group.name}</span>
                            <br />
                            - {group.description} -
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
