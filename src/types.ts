export interface PatientProfile {
    level: number;
    associated_psychologist: string | null;
}

export interface DoctorProfile {
    professional_information: { qualification: string };
    chatgroup_nickname: string;
    rates: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    user_type: string; // "patient" or "doctor"
    patient_profile?: PatientProfile;
    doctor_profile?: DoctorProfile;
}
