"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PatientProfile {
    level: number;
    associated_psychologist: string | null;
    associated_psychologist_name: string | null;
    sent_requests?: string[]; // IDs of doctors to whom requests have been sent
}

interface DoctorProfile {
    professional_information: {
        specialization: string;
        experience: string;
        qualifications: string;
    };
    chatgroup_nickname: string;
    rates: string;
    location?: string;
    expertise?: string[];
    rating?: number;
}

export interface User {
    id: number;
    username: string;
    email: string;
    user_type: string;
    patient_profile?: PatientProfile;
    doctor_profile?: DoctorProfile;
}

interface Doctor {
    id: number;
    username: string;
    name: string;
    profile_image: string;
    specialization: string;
    location: string;
    experience: string;
    rating: number;
    expertise: string[];
    education: string;
    requestStatus?: string; // Changed to string to accommodate any status value
}

const isBackendConnected = process.env.NEXT_PUBLIC_BACKEND_CONNECTED === "true";

// Mock data for doctors when backend is not connected
const mockDoctors: Doctor[] = [
    {
        id: 1,
        username: "drali",
        name: "Dr. Ali Hamza",
        profile_image: "/doctor_image.jpg",
        specialization: "Cognitive Therapy",
        location: "Lahore",
        experience: "10 yrs",
        rating: 4.7,
        expertise: ["CBT", "Anxiety"],
        education: "MSc Clinical Psych",
        requestStatus: 'none'
    },
    {
        id: 2,
        username: "drailah",
        name: "Dr. Ailah Ahmed",
        profile_image: "/psychologist.jpeg",
        specialization: "Cognitive Therapy",
        location: "Lahore",
        experience: "10 yrs",
        rating: 4.7,
        expertise: ["CBT", "Anxiety"],
        education: "MSc Clinical Psych",
        requestStatus: 'none'
    },
    {
        id: 3,
        username: "drsara",
        name: "Dr. Sara Khan",
        profile_image: "/psychologist.jpeg",
        specialization: "Clinical Psychologist",
        location: "Lahore",
        experience: "10 yrs",
        rating: 4.7,
        expertise: ["CBT", "Anxiety"],
        education: "MSc Clinical Psych",
        requestStatus: 'pending'
    },
    {
        id: 4,
        username: "drfahad",
        name: "Dr. Fahad Malik",
        profile_image: "/doctor_image.jpg",
        specialization: "Behavioral Therapy",
        location: "Karachi",
        experience: "15 yrs",
        rating: 4.9,
        expertise: ["PTSD", "Depression"],
        education: "PhD Clinical Psychology",
        requestStatus: 'none'
    },
    {
        id: 5,
        username: "draisha",
        name: "Dr. Aisha Mahmood",
        profile_image: "/psychologist.jpeg",
        specialization: "Family Therapy",
        location: "Islamabad",
        experience: "8 yrs",
        rating: 4.5,
        expertise: ["Family Counseling", "Relationship Issues"],
        education: "MSc Family Psychology",
        requestStatus: 'none'
    },
    {
        id: 6,
        username: "drhasan",
        name: "Dr. Hasan Raza",
        profile_image: "/doctor_image.jpg",
        specialization: "Addiction Therapy",
        location: "Karachi",
        experience: "12 yrs",
        rating: 4.8,
        expertise: ["Addiction", "Substance Abuse"],
        education: "PhD Psychology",
        requestStatus: 'none'
    }
];

export default function DoctorsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [searchCity, setSearchCity] = useState("");
    const [searchSpecialty, setSearchSpecialty] = useState("");
    const [filterType, setFilterType] = useState<"experience" | "rating" | "specialty">("experience");
    const router = useRouter();

    useEffect(() => {
        const sessionKey = localStorage.getItem("session_key");

        if (!sessionKey) {
            router.push("/login");
            return;
        }

        // Fetch user data
        if (isBackendConnected) {
            const fetchUserData = async () => {
                try {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/data/`,
                        {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Token ${sessionKey}`,
                            },
                        }
                    );

                    const data = await response.json();
                    setUser(data);
                    
                    // After fetching user, fetch doctors
                    fetchDoctors(sessionKey, data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    router.push("/login");
                }
            };

            fetchUserData();
        } else {
            // Use mock data when not connected to backend
            const userData = localStorage.getItem("user_data");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                
                // Update mock doctors with request statuses if user has sent requests
                const updatedDoctors = [...mockDoctors].map(doctor => {
                    if (parsedUser.patient_profile?.sent_requests?.includes(doctor.id.toString())) {
                        return { ...doctor, requestStatus: 'pending' };
                    }
                    return doctor;
                });
                
                setDoctors(updatedDoctors);
            } else {
                router.push("/login");
            }
        }
    }, [router]);
    
    // Function to fetch doctors from backend
    const fetchDoctors = async (sessionKey: string, userData: User) => {
        if (!isBackendConnected) return;
        
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/doctors/`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${sessionKey}`,
                    },
                }
            );

            let doctorsData = await response.json();
            
            // Update request status based on user's sent requests
            if (userData.patient_profile?.sent_requests) {
                doctorsData = doctorsData.map((doctor: Doctor) => ({
                    ...doctor,
                    requestStatus: userData.patient_profile?.sent_requests?.includes(doctor.id.toString()) 
                        ? 'pending' 
                        : 'none'
                }));
            }
            
            setDoctors(doctorsData);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            // Fallback to mock data if fetch fails
            setDoctors(mockDoctors);
        }
    };
    
    // Function to send a request to a doctor
    const sendRequest = async (doctorId: number) => {
        if (!user) return;
        
        if (isBackendConnected) {
            try {
                const sessionKey = localStorage.getItem("session_key");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/send-request/${doctorId}/`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${sessionKey}`,
                        },
                    }
                );
                
                if (response.ok) {
                    // Update doctors list with the new request status
                    setDoctors(prevDoctors => 
                        prevDoctors.map(doctor => 
                            doctor.id === doctorId ? { ...doctor, requestStatus: 'pending' } : doctor
                        )
                    );
                    
                    // Update user's sent_requests in local state
                    setUser(prevUser => {
                        if (!prevUser) return null;
                        
                        const updatedSentRequests = [
                            ...(prevUser.patient_profile?.sent_requests || []),
                            doctorId.toString()
                        ];
                        
                        return {
                            ...prevUser,
                            patient_profile: {
                                ...(prevUser.patient_profile || { level: 1, associated_psychologist: null, associated_psychologist_name: null }),
                                sent_requests: updatedSentRequests
                            }
                        };
                    });
                }
            } catch (error) {
                console.error("Error sending request:", error);
            }
        } else {
            // For mock data, just update the local state
            setDoctors(prevDoctors => 
                prevDoctors.map(doctor => 
                    doctor.id === doctorId ? { ...doctor, requestStatus: 'pending' } : doctor
                )
            );
            
            // Update mock user data in localStorage
            const userData = localStorage.getItem("user_data");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                const updatedSentRequests = [
                    ...(parsedUser.patient_profile?.sent_requests || []),
                    doctorId.toString()
                ];
                
                const updatedUser = {
                    ...parsedUser,
                    patient_profile: {
                        ...(parsedUser.patient_profile || {}),
                        sent_requests: updatedSentRequests
                    }
                };
                
                localStorage.setItem("user_data", JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        }
    };
    
    // Function to remove a request
    const removeRequest = async (doctorId: number) => {
        if (!user) return;
        
        if (isBackendConnected) {
            try {
                const sessionKey = localStorage.getItem("session_key");
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/remove-request/${doctorId}/`,
                    {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Token ${sessionKey}`,
                        },
                    }
                );
                
                if (response.ok) {
                    // Update doctors list with the new request status
                    setDoctors(prevDoctors => 
                        prevDoctors.map(doctor => 
                            doctor.id === doctorId ? { ...doctor, requestStatus: 'none' } : doctor
                        )
                    );
                    
                    // Update user's sent_requests in local state
                    setUser(prevUser => {
                        if (!prevUser || !prevUser.patient_profile?.sent_requests) return prevUser;
                        
                        const updatedSentRequests = prevUser.patient_profile.sent_requests.filter(
                            id => id !== doctorId.toString()
                        );
                        
                        return {
                            ...prevUser,
                            patient_profile: {
                                ...prevUser.patient_profile,
                                sent_requests: updatedSentRequests
                            }
                        };
                    });
                }
            } catch (error) {
                console.error("Error removing request:", error);
            }
        } else {
            // For mock data, just update the local state
            setDoctors(prevDoctors => 
                prevDoctors.map(doctor => 
                    doctor.id === doctorId ? { ...doctor, requestStatus: 'none' } : doctor
                )
            );
            
            // Update mock user data in localStorage
            const userData = localStorage.getItem("user_data");
            if (userData) {
                const parsedUser = JSON.parse(userData);
                
                if (parsedUser.patient_profile?.sent_requests) {
                    const updatedSentRequests = parsedUser.patient_profile.sent_requests.filter(
                        (id: string) => id !== doctorId.toString()
                    );
                    
                    const updatedUser = {
                        ...parsedUser,
                        patient_profile: {
                            ...parsedUser.patient_profile,
                            sent_requests: updatedSentRequests
                        }
                    };
                    
                    localStorage.setItem("user_data", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            }
        }
    };
    
    // Filter doctors based on search criteria
    const filteredDoctors = doctors.filter(doctor => {
        const cityMatch = searchCity === "" || 
            doctor.location.toLowerCase().includes(searchCity.toLowerCase());
        
        const specialtyMatch = searchSpecialty === "" || 
            doctor.expertise.some(skill => 
                skill.toLowerCase().includes(searchSpecialty.toLowerCase())
            ) || 
            doctor.specialization.toLowerCase().includes(searchSpecialty.toLowerCase());
        
        return cityMatch && specialtyMatch;
    });
    
    // Sort doctors based on filter type
    const sortedDoctors = [...filteredDoctors].sort((a, b) => {
        if (filterType === "experience") {
            // Extract numbers from experience strings like "10 yrs" or "8 years"
            const expA = parseInt(a.experience.match(/\d+/)?.[0] || "0");
            const expB = parseInt(b.experience.match(/\d+/)?.[0] || "0");
            return expB - expA; // Higher experience first
        } else if (filterType === "rating") {
            return b.rating - a.rating; // Higher rating first
        } else if (filterType === "specialty") {
            // When specialty filter is selected, prioritize based on search term if present
            if (searchSpecialty) {
                // Check if specialization matches directly
                const aSpecMatch = a.specialization.toLowerCase().includes(searchSpecialty.toLowerCase());
                const bSpecMatch = b.specialization.toLowerCase().includes(searchSpecialty.toLowerCase());
                
                if (aSpecMatch && !bSpecMatch) return -1;
                if (!aSpecMatch && bSpecMatch) return 1;
                
                // Check expertise matches
                const aExpertiseMatches = a.expertise.filter(e => 
                    e.toLowerCase().includes(searchSpecialty.toLowerCase())).length;
                const bExpertiseMatches = b.expertise.filter(e => 
                    e.toLowerCase().includes(searchSpecialty.toLowerCase())).length;
                
                return bExpertiseMatches - aExpertiseMatches;
            }
            
            // If no search term, sort alphabetically by specialization
            return a.specialization.localeCompare(b.specialization);
        }
        
        return 0;
    });
    
    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-blue-50">
                <p className="text-xl text-gray-600">Loading...</p>
            </div>
        );
    }
    
    // If the user is a doctor, show their dashboard


    return (
        <div className="min-h-screen py-8" 
             style={{
                backgroundImage: "url('/bg/patientbg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center"
             }}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-800 mb-1 font-weight-700">Welcome, {user.username}</h1>
                    <p className="text-lg text-blue-600">Choose your support companion <span role="img" aria-label="heart">💖</span></p>
                </div>
                
                {/* Filter options */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <button 
                        className={`px-4 py-1.5 rounded-full text-[#1E3CA7] flex items-center gap-2 border ${filterType === "experience" ? 'bg-white border-blue-300 font-medium' : 'bg-white border-gray-200 shadow-sm'}`}
                        onClick={() => setFilterType("experience")}
                    >
                        <span className={`${filterType === "experience" ? 'text-green-600' : 'text-blue-600'}`}>⧖</span> Sort by Experience
                    </button>
                    <button 
                        className={`px-4 py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-2 border ${filterType === "rating" ? 'bg-white border-yellow-300 font-medium' : 'bg-white border-gray-200 shadow-sm'}`}
                        onClick={() => setFilterType("rating")}
                    >
                        <span className="text-yellow-400">★</span> Highest Rated
                    </button>
                    <button 
                        className={`px-4 py-1.5 text-[#1E3CA7] rounded-full flex items-center gap-2 border ${filterType === "specialty" ? 'bg-white border-purple-300 font-medium' : 'bg-white border-gray-200 shadow-sm'}`}
                        onClick={() => setFilterType("specialty")}
                    >
                        <span className="text-blue-500">♦</span> Specialties
                    </button>
                </div>
                  {/* Search inputs and help text in one row */}
                <div className="flex flex-wrap justify-center items-center gap-4 mb-7">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by city e.g, Lahore"
                            className="pl-10 pr-4 font-weight-400 py-2 rounded-full bg-[#FFD2DC] border-0 w-64 shadow-sm text-[#444444]"
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5">🔍</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by specialties e.g, CBT"
                            className="pl-10 pr-4 py-2 font-weight-400 rounded-full bg-[#FFD2DC] border-0 w-64 shadow-sm text-[#444444]"
                            value={searchSpecialty}
                            onChange={(e) => setSearchSpecialty(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5">🔍</span>
                    </div>
                      <div className="bg-[#ECBDF94D]  rounded-full px-5 py-2 flex items-center gap-2 shadow-sm border border-purple-100">
                        <span className="text-[#1E3CA7] font-weight-600">Not sure who to choose?</span>
                        <a href="#" className="text-indigo-800 font-medium">View profiles to learn more</a>
                    </div>
                </div>
                
                {/* Doctors grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedDoctors.map((doctor) => (
                        <div key={doctor.id} className="bg-white bg-opacity-95 rounded-xl p-6 shadow border-0">
                            <div className="flex items-start gap-4">
                                {/* Profile image */}
                                <div className="rounded-full overflow-hidden w-20 h-20 border-2 border-blue-200 flex-shrink-0 bg-blue-50">
                                    <Image 
                                        src={doctor.profile_image} 
                                        alt={doctor.name}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                
                                {/* Doctor info */}
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-blue-800 font-weight-700">{doctor.name}</h3>
                                    <p className="text-blue-600 font-weight-400">{doctor.specialization}</p>
                                    <div className="flex items-center mt-1">
                                        <span className="text-yellow-400">★</span>
                                        <span className="ml-1 font-medium text-gray-700 font-weight-400">{doctor.rating} Rating</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Doctor details */}                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-3 text-gray-700 text-sm font-weight-400">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500">📍</span>
                                    <span>Location: {doctor.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">💬</span>
                                    <span>Experience: {doctor.experience}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600">🎓</span>
                                    <span>{doctor.education}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-pink-400">💖</span>
                                    <span>Expertise: {doctor.expertise.join(", ")}</span>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="mt-5 flex justify-between">                                <button className="bg-[#D7E2FE] hover:bg-purple-300 text-[#1E3CA7] px-6 py-2 rounded-full flex items-center gap-2 font-bold font-weight-700">
                                    <span>💜</span> View Profile
                                </button>
                                
                                {doctor.requestStatus === 'pending' ? (
                                    <div className="flex flex-col items-end">
                                        <div className="text-blue-700 mb-1.5 flex items-center gap-2 font-medium">
                                            <span className="text-amber-700">⌛</span> Status: Pending Request
                                        </div>                                        <button 
                                            onClick={() => removeRequest(doctor.id)} 
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-1.5 rounded-full text-sm font-bold font-weight-700"
                                        >
                                            Remove Request
                                        </button>
                                    </div>
                                ) : (                                    <button 
                                        onClick={() => sendRequest(doctor.id)} 
                                        className="bg-[#FFF8EC] hover:bg-yellow-200 text-[#444444] px-6 py-2 rounded-full flex items-center gap-2 font-bold font-weight-700"
                                    >
                                        🤝 Send Request
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Empty state */}
                {sortedDoctors.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-xl text-gray-600">No doctors found matching your criteria.</p>
                        <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
