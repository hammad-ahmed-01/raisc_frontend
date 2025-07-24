# RAISC Frontend API Documentation

This document lists all APIs used in the new frontend, their expected data, and where they are called.

---

## 1. Login

- **Endpoint:** `/users/login/` (POST)
- **Request:**  
  ```json
  { "username": string, "password": string }
  ```
- **Response:**  
  ```json
  {
    "token": string,
    "user": {
      "id": number,
      "username": string,
      "email": string,
      "user_type": string,
      "patient_profile"?: {
        "level": number,
        "associated_psychologist": string | null,
        "associated_psychologist_name": string | null,
        "sent_requests"?: string[]
      },
      "doctor_profile"?: {
        "professional_information": {
          "specialization": string,
          "experience": string,
          "qualifications": string
        },
        "chatgroup_nickname": string,
        "rates": string
      }
    }
  }
  ```
- **Called In:**
  - Page: `/login` (`app/login/page.tsx`)

---

## 2. Register

- **Endpoint:** `/users/register/` (POST)
- **Request:**  
  ```json
  { "full_name": string, "email": string, "password": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/register` (`app/register/page.tsx`)

---

## 3. Check Auth

- **Endpoint:** (custom logic, uses session key from localStorage)
- **Response:**  
  ```json
  {
    "isAuthenticated": boolean,
    "user"?: {
      "id": number,
      "username": string,
      "email": string,
      "user_type": string,
      "patient_profile"?: {
        "level": number,
        "associated_psychologist": string | null,
        "associated_psychologist_name": string | null,
        "sent_requests"?: string[]
      },
      "doctor_profile"?: {
        "professional_information": {
          "specialization": string,
          "experience": string,
          "qualifications": string
        },
        "chatgroup_nickname": string,
        "rates": string
      }
    },
    "error"?: string
  }
  ```
- **Called In:**  
  Utility: `checkAuth` from `lib/auth.ts`  
  Used in most pages for authentication checks:
  - `/dashboard` (`app/dashboard/page.tsx`)
  - `/Doctors` (`app/Doctors/page.tsx`)
  - `/Patient` (`app/Patient/page.tsx`)
  - `/requests` (`app/requests/page.tsx`)
  - `/AssociatedPsychologist` (`app/AssociatedPsychologist/page.tsx`)
  - `/chatbot` (`app/chatbot/page.tsx`)
  - `/chatbot-insights` (`app/chatbot-insights/page.tsx`)
  - `/settings/account` (`app/settings/account/page.tsx`)
  - `/settings/change-email` (`app/settings/change-email/page.tsx`)
  - `/settings/change-password` (`app/settings/change-password/page.tsx`)
  - `/settings/edit-profile` (`app/settings/edit-profile/page.tsx`)
  - `/settings/notifications` (`app/settings/notifications/page.tsx`)

---

## 4. Get User Data

- **Endpoint:** `/users/data/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  {
    "id": number,
    "username": string,
    "email": string,
    "user_type": string,
    "patient_profile"?: {
      "level": number,
      "associated_psychologist": string | null,
      "associated_psychologist_name": string | null,
      "sent_requests"?: string[]
    },
    "doctor_profile"?: {
      "professional_information": {
        "specialization": string,
        "experience": string,
        "qualifications": string
      },
      "chatgroup_nickname": string,
      "rates": string
    }
  }
  ```
- **Called In:**
  - Page: `/Doctors` (`app/Doctors/page.tsx`)

---

## 5. Get Doctor Profile

- **Endpoint:** `/doctor/profile/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  {
    "id": number,
    "username": string,
    "email": string,
    "user_type": string,
    "display_name": string,
    "phone": string,
    "last_login": string,
    "member_since": string,
    "rating": number,
    "organization": string,
    "location": string,
    "patients_assigned": number,
    "qualifications": string[],
    "university": string,
    "graduation_year": string,
    "doctor_profile": {
      "professional_information": {
        "specialization": string,
        "experience": string,
        "qualifications": string
      },
      "chatgroup_nickname": string,
      "rates": string
    }
  }
  ```
- **Called In:**
  - Page: `/settings/account` (`app/settings/account/page.tsx`)
  - Component: `DoctorMyAccount` (`components/DoctorSettings/Account/MyAccount.tsx`)

---

## 6. Get Patient Profile

- **Endpoint:** `/patient/profile/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  {
    "displayName": string,
    "username": string,
    "email": string,
    "emailVerified": boolean,
    "lastLogin": string,
    "therapyFocus": string,
    "sessionsCompleted": number,
    "lastSession": string,
    "patient_profile": {
      "level": number,
      "associated_psychologist": string | null,
      "associated_psychologist_name": string | null,
      "sent_requests"?: string[]
    }
  }
  ```
- **Called In:**
  - Page: `/settings/account` (`app/settings/account/page.tsx`)
  - Component: `PatientMyAccount` (`components/PatientSettings/Account/MyAccount.tsx`)

---

## 7. Change Email

- **Endpoint:** `/doctor/change-email/` or `/patient/change-email/` (POST)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:**  
  ```json
  { "current_email": string, "new_email": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/settings/change-email` (`app/settings/change-email/page.tsx`)

---

## 8. Change Password

- **Endpoint:** `/doctor/change-password/` or `/patient/change-password/` (POST)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:**  
  ```json
  { "current_password": string, "new_password": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/settings/change-password` (`app/settings/change-password/page.tsx`)

---

## 9. Get Doctors List

- **Endpoint:** `/doctors/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  [
    {
      "id": number,
      "username": string,
      "name": string,
      "profile_image": string,
      "specialization": string,
      "location": string,
      "experience": string,
      "rating": number,
      "expertise": string[],
      "education": string,
      "requestStatus"?: string
    }
  ]
  ```
- **Called In:**
  - Page: `/Doctors` (`app/Doctors/page.tsx`)
  - Component: Doctor cards in `/Doctors`

---

## 10. Send Request to Doctor

- **Endpoint:** `/send-request/<doctorId>/` (POST)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:** _none_
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/Doctors` (`app/Doctors/page.tsx`)
  - Component: Doctor cards in `/Doctors`
  - Component: `Psychologist` (`app/AssociatedPsychologist/components/Psychologist.tsx`)

---

## 11. Remove Request to Doctor

- **Endpoint:** `/remove-request/<doctorId>/` (DELETE)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:** _none_
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/Doctors` (`app/Doctors/page.tsx`)
  - Component: Doctor cards in `/Doctors`
  - Component: `Psychologist` (`app/AssociatedPsychologist/components/Psychologist.tsx`)

---

## 12. Get Pending Requests (Doctor)

- **Endpoint:** `/doctor/requests/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  [
    {
      "id": string,
      "name": string,
      "email": string,
      "age": number,
      "gender": string,
      "condition": string,
      "message": string,
      "requestDate": string
    }
  ]
  ```
- **Called In:**
  - Page: `/requests` (`app/requests/page.tsx`)
  - Component: `PendingRequestsPage` (`components/DoctorDashboard/requests/PendingRequestsPage.tsx`)
  - Component: `PatientRequestCard` (`components/DoctorDashboard/requests/PatientRequestCard.tsx`)

---

## 13. Get Patients List (Doctor)

- **Endpoint:** `/users/doctor/patients/` (GET)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  ```json
  [
    {
      "id": number,
      "user": {
        "id": number,
        "username": string,
        "email": string
      },
      "profile_data": {
        "Age": string,
        "name": string,
        "Gender": string,
        "History": string,
        "Condition": string
      }
    }
  ]
  ```
- **Called In:**
  - Page: `/Patient` (`app/Patient/page.tsx`)
  - Component: `PatientList` (`app/Patient/components/PatientList.tsx`)
  - Component: `PatientCard` (`app/Patient/components/PatientCard.tsx`)

---

## 14. Create Session (Doctor)

- **Endpoint:** `/users/doctor/create-session/` (POST)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:**  
  ```json
  { "patient_id": number, "title": string, "description": string, "date": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Component: `CreateSessionForm` (`app/Patient/components/CreateNewSession.tsx`)
  - Component: `PatientCard` (`app/Patient/components/PatientCard.tsx`)

---

## 15. Chatbot API (Patient)

- **Endpoint:** `/api/chat` (POST)
- **Request:**  
  ```json
  { "session_key": string, "message": string }
  ```
- **Response:**  
  ```json
  { "response": string }
  ```
- **Called In:**
  - Page: `/chatbot` (`app/chatbot/page.tsx`)
  - Component: `ChatWindow` (`app/chatbot/components/ChatWindow.tsx`)

---

## 16. Chatbot History API

- **Endpoint:** `/api/history/<session_key>` (GET)
- **Response:**  
  ```json
  {
    "chat_history": [
      { "role": string, "content": string }
    ]
  }
  ```
- **Called In:**
  - Page: `/chatbot` (`app/chatbot/page.tsx`)
  - Component: `ChatWindow` (`app/chatbot/components/ChatWindow.tsx`)

---

## 17. Contact Form API

- **Endpoint:** `/api/contact` (POST)
- **Request:**  
  ```json
  { "firstName": string, "lastName": string, "email": string, "phone": string, "message": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/LandingPage/Contact` (`app/LandingPage/Contact.tsx`)

---

## 18. Notification Settings API

- **Endpoint:** `/doctor/notifications/` or `/patient/notifications/` (GET/PATCH)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Response:**  
  For doctor:
  ```json
  {
    "appointment_reminders": boolean,
    "patient_messages": boolean,
    "session_confirmations": boolean,
    "schedule_changes": boolean,
    "emergency_alerts": boolean,
    "weekly_reports": boolean,
    "marketing_emails": boolean
  }
  ```
  For patient:
  ```json
  {
    "session_alerts": boolean,
    "reschedule_cancel": boolean,
    "doctor_updates": boolean,
    "platform_updates": boolean
  }
  ```
- **Called In:**
  - Page: `/settings/notifications` (`app/settings/notifications/page.tsx`)

---

## 19. Edit Profile API

- **Endpoint:** `/users/profile/` (PATCH)
- **Headers:** `{ Authorization: Token <session_key> }`
- **Request:**  
  ```json
  { [field]: value }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/settings/edit-profile` (`app/settings/edit-profile/page.tsx`)
  - Component: `EditPatientProfile` (`components/PatientSettings/EditProfile/EditProfile.tsx`)
  - Component: `EditDoctorProfile` (`components/DoctorSettings/EditProfile/EditProfile.tsx`)

---

## 20. Associated Psychologist Data

- **Endpoint:** `/api/psychologist/current` (GET)
- **Response:**  
  ```json
  {
    "name": string,
    "role": string,
    "affiliation": string,
    "image": string,
    "about": string,
    "qualifications": string[],
    "languages": string[],
    "experience": string,
    "rating": number,
    "reviews": number
  }
  ```
- **Called In:**
  - Page: `/AssociatedPsychologist` (`app/AssociatedPsychologist/page.tsx`)
  - Component: `Psychologist` (`app/AssociatedPsychologist/components/Psychologist.tsx`)
  - Component: `Association` (`app/AssociatedPsychologist/components/Association.tsx`)

---

## 21. Chatbot Insights (Doctor)

- **Endpoint:** (dummy data, intended for future API)
- **Response:**  
  ```json
  [
    {
      "id": string,
      "date": string,
      "summary": string,
      "sentiment": {
        "avg": number,
        "min": number,
        "max": number,
        "tone": string
      }
    }
  ]
  ```
- **Called In:**
  - Page: `/chatbot-insights` (`app/chatbot-insights/page.tsx`)
  - Component: `FiltersSidebar` (`app/chatbot-insights/components/FiltersSidebar.tsx`)
  - Component: `ChatEntriesSection` (`app/chatbot-insights/components/ChatEntriesSection.tsx`)

---

## 22. Doctor Dashboard APIs

- **Endpoint:** `/users/doctor/sessions/` (GET)
- **Response:**  
  ```json
  [
    {
      "id": number,
      "title": string,
      "description": string,
      "date": string,
      "doctor_summary"?: string
    }
  ]
  ```
- **Endpoint:** `/users/doctor/manage-request/<requestId>/` (PATCH)
- **Request:**  
  ```json
  { "status": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Endpoint:** `/users/doctor/update-summary/<sessionId>/` (PATCH)
- **Request:**  
  ```json
  { "doctor_summary": string }
  ```
- **Response:**  
  ```json
  { "message": string }
  ```
- **Called In:**
  - Page: `/DoctorDashboard` (`components/DoctorDashboard/page.tsx`)
  - Component: `SessionCalendar` (`components/DoctorDashboard/components/SessionCalendar.tsx`)
  - Component: `DoctorProfileCard` (`components/DoctorDashboard/components/DoctorProfileCard.tsx`)
  - Page: `/requests` (`app/requests/page.tsx`)
  - Component: `PendingRequestsPage` (`components/DoctorDashboard/requests/PendingRequestsPage.tsx`)
  - Component: `PatientRequestCard` (`components/DoctorDashboard/requests/PatientRequestCard.tsx`)

---

## 23. Patient Dashboard APIs

- **Endpoint:** `/users/patient/sessions/` (GET)
- **Response:**  
  ```json
  [
    {
      "id": number,
      "title": string,
      "description": string,
      "date": string,
      "doctor_name": string
    }
  ]
  ```
- **Called In:**
  - Page: `/PatientDashboards/RegularPatient/page.tsx`
  - Component: `PreviousSessionCard` (`components/PatientDashboards/RegularPatient/components/PreviousSessionCard.tsx`)

---

## 24. Quotes API (Dummy/Static)

- **Endpoint:** (static/dummy, not API-based)
- **Response:**  
  ```json
  [
    { "text": string, "author": string }
  ]
  ```
- **Called In:**
  - Component: `QuoteCarousel` (`components/PatientDashboards/ReturningPatient/components/QuoteCarousel.tsx`)
  - Component: `Quote` (`components/PatientDashboards/NewPatient/components/Quote.tsx`)
  - Other dashboard components

---

## 25. Resources API (Dummy/Static)

- **Endpoint:** (static/dummy, not API-based)
- **Response:**  
  ```json
  [
    { "title": string, "url": string, "type": string }
  ]
  ```
- **Called In:**
  - Component: `Resources` (`components/PatientDashboards/ReturningPatient/components/Resources.tsx`)
  - Other dashboard components

---

**Note:**  
- All endpoints expect and return JSON unless otherwise specified.
- All API calls use the session key from localStorage for authentication.
- Dummy/mock data is used when `NEXT_PUBLIC_BACKEND_CONNECTED` is false.