import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const full_name = username.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    // Send data to Django backend
    const backendUrl = `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/new-register/`;

    const djangoResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name,
        email: sanitizedEmail,
        password,
      }),
    });

    const data = await djangoResponse.json();

    if (!djangoResponse.ok) {
      return NextResponse.json(
        { message: data.message || "Registration failed." },
        { status: djangoResponse.status }
      );
    }

    // Email configuration validation
    if (
      !process.env.ZOHO_EMAIL ||
      !process.env.ZOHO_PASSWORD ||
      !process.env.CONTACT_RECIPIENT_EMAIL ||
      !process.env.ZOHO_SMTP_HOST ||
      !process.env.ZOHO_SMTP_PORT
    ) {
      return NextResponse.json(
        { message: "Email service configuration error" },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: parseInt(process.env.ZOHO_SMTP_PORT, 10),
      secure: parseInt(process.env.ZOHO_SMTP_PORT, 10) === 465, // true for SSL
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    // Verify transporter before sending
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      return NextResponse.json(
        { message: "Email service configuration error" },
        { status: 500 }
      );
    }

    // Prepare email messages
    const adminMailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: process.env.CONTACT_RECIPIENT_EMAIL,
      subject: `New User Registration - ${full_name}`,
      html: `
        <h2>New User Registered</h2>
        <p><strong>Name:</strong> ${full_name}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
      `,
    };

    const autoResponseOptions = {
      from: process.env.ZOHO_EMAIL,
      to: sanitizedEmail,
      subject: "Welcome to RAISC - Registration Successful",
      html: `
        <h2>Welcome, ${full_name}!</h2>
        <p>Thank you for registering with RAISC. Your account has been successfully created.</p>
        <p>We appreciate your interest and will keep you updated.</p>
      `,
    };

    // Send both emails in parallel
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(autoResponseOptions),
    ]);

    return NextResponse.json(
      { message: "Registration successful. Confirmation email sent.", data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
