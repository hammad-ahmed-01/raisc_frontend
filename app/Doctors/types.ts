// app/DoctorsPage/types.ts

export interface PatientProfile {
  level: number;
  associated_psychologist: string | null;
  associated_psychologist_name: string | null;
  sent_requests?: string[];
  /** used for correct display name resolution */
  profile_data?: Record<string, unknown> | null;
}

export interface DoctorProfilePI {
  specialization?: string;
  experience?: string | number;
  location?: string;
  expertise?: string[] | string;
  profile_image?: string;
  rating?: number;
  education?: string;
  description?: string; // "About me"
  bio?: string;         // fallback for older data
  display_name?: string;
}

export interface DoctorProfile {
  professional_information: DoctorProfilePI;
  chatgroup_nickname: string;
  rates: string | number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "patient" | "doctor" | "organization";
  display_name?: string;
  patient_profile?: PatientProfile | null;
  doctor_profile?: DoctorProfile | null;
}

export interface Doctor {
  id: number;
  username: string;
  name: string;
  profile_image: string;
  specialization: string;
  location: string;
  experience: string | number;
  rating: number;
  expertise: string[];
  education: string;
  description?: string; // shown as "About me" snippet
  rates?: string;
  requestStatus?: "none" | "pending";
}
