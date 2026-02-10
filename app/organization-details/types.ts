// app/organization-details/types.ts

export interface OrganizationDetails {
  phone?: string;
  website?: string;
  specialties?: string[];
  license_number?: string;
  established_year?: number;
  [key: string]: any;
}

export interface User {
  id: number;
  username: string;
  email: string;
  user_type: "doctor" | "patient" | "organization";
}

export interface ProfessionalInformation {
  rating?: number;
  location?: string;
  education?: string;
  expertise?: string[];
  experience?: string | number;
  description?: string;
  display_name?: string;
  profile_image?: string;
  specialization?: string;
  [key: string]: any;
}

export interface Doctor {
  id: number;
  user: User;
  professional_information?: ProfessionalInformation;
  chatgroup_nickname?: string;
  rates?: string;
}

export interface Organization {
  id: number;
  name: string;
  location: string;
  details: OrganizationDetails;
  user_id: number;
  doctors: Doctor[];
}