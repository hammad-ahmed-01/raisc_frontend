import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface PatientProfileData {
  level: number;
  associated_psychologist?: string | null;
  profile_data?: string | null;
}

interface DoctorProfileData {
  professional_information?: string | null;
  chatgroup_nickname?: string | null;
  rates?: string | null;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  user_type: "patient" | "doctor";
  patient_profile?: PatientProfileData;
  doctor_profile?: DoctorProfileData;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterFormData;
    const { username, email, password, user_type, patient_profile, doctor_profile } = body;

    const errors: string[] = [];

    if (!username || !username.trim()) errors.push("Username is required");
    else if (username.trim().length < 2) errors.push("Username must be at least 2 characters");
    else if (username.trim().length > 150) errors.push("Username must be less than 150 characters");

    if (!email || !email.trim()) errors.push("Email is required");
    else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email.trim())) errors.push("Please enter a valid email address");
    }

    if (!password || !password.trim()) errors.push("Password is required");
    else {
      if (password.length < 8) errors.push("Password must be at least 8 characters long");
      if (password.length > 128) errors.push("Password must be less than 128 characters");
      if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
      if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
      if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
      if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) errors.push("Password must contain at least one special character");
    }

    if (!user_type || !["patient", "doctor"].includes(user_type)) errors.push("User type must be 'patient' or 'doctor'");

    if (user_type === "patient" && !patient_profile) errors.push("Patient profile data is required for patients.");
    if (user_type === "doctor" && !doctor_profile) errors.push("Doctor profile data is required for doctors.");

    if (errors.length > 0) return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    if (!process.env.NEXT_PUBLIC_DJANGO_BASE_URL) return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD || !process.env.CONTACT_RECIPIENT_EMAIL) return NextResponse.json({ error: "Email service configuration error" }, { status: 500 });

    const sanitizedData: RegisterFormData = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      user_type,
      ...(user_type === "patient" ? { patient_profile } : {}),
      ...(user_type === "doctor" ? { doctor_profile } : {}),
    };

    const djangoResponse = await fetch(`${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}users/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitizedData),
    });

    if (!djangoResponse.ok) {
      let errorData;
      try { errorData = await djangoResponse.json(); } catch { errorData = { message: "Registration failed" }; }
      return NextResponse.json({ error: "Registration failed", details: errorData }, { status: djangoResponse.status });
    }

    const data = await djangoResponse.json();

    // Send welcome email
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: parseInt(process.env.ZOHO_SMTP_PORT || "587"),
      secure: false,
      auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
    });

    try { await transporter.verify(); } catch (verifyError) {
      console.error("SMTP configuration error:", verifyError);
      return NextResponse.json({ error: "Email service configuration error" }, { status: 500 });
    }

    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: sanitizedData.email,
      subject: "Welcome to RAISC - Your Registration is Complete",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1E3CA7; text-align: center;">Welcome to RAISC</h2>
          <p>Dear ${sanitizedData.username},</p>
          <p>Thank you for registering with RAISC. Your account has been successfully created.</p>
          <p>We look forward to assisting you with our mental health services.</p>
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 14px;">The RAISC Team</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
