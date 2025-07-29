export interface PatientProfile {
    level: number;
    associated_psychologist: string | null;
    associated_psychologist_name: string | null;
}

export interface DoctorProfile {
    professional_information: {
        specialization: string;
        experience: string;
        qualifications: string;
    };
    chatgroup_nickname: string;
    rates: string;
}

export interface OrganizationProfile {
    organization_name: string;
    description: string;
    logo_url?: string;
    contact_email: string;
    contact_numbers: string[];
    location: string;
    linkedin?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    user_type: string; // "patient" | "doctor" | "organization"
    patient_profile?: PatientProfile;
    doctor_profile?: DoctorProfile;
    organization_profile?: OrganizationProfile;
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    condition: string;
}

