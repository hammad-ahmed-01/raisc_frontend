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

    // Admin notification email
    const adminMailOptions = {
    from: process.env.ZOHO_EMAIL,
    to: process.env.CONTACT_RECIPIENT_EMAIL,
    subject: `New User Registration - ${full_name}`,
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1E3CA7; text-align: center;">New User Registered</h2>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Name:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 14px;">
            This is an automated notification from the RAISC registration system.
            </p>
        </div>
        </div>
    `,
    };

    // Auto-response email for the user
    const autoResponseOptions = {
    from: process.env.ZOHO_EMAIL,
    to: sanitizedEmail,
    subject: 'Welcome to RAISC - Registration Successful',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1E3CA7; text-align: center;">Welcome to RAISC</h2>
        
        <div style="text-align: center; margin: 30px 0;">
            <img src="https://your-domain.com/logo.png" alt="RAISC Logo" style="max-width: 150px;" />
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p>Dear ${full_name.split(' ')[0]},</p>
            <p>Thank you for registering with RAISC. Your account has been successfully created.</p>
            <p>We are excited to have you on board and will keep you updated about new features and services.</p>
        </div>

        <div style="background-color: #e9f5fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1E3CA7; margin-top: 0;">Your Registration Details:</h4>
            <p><strong>Name:</strong> ${full_name}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666;">
            If you have any urgent concerns, please don't hesitate to call us directly.
            </p>
            <p style="color: #1E3CA7; font-weight: bold;">
            Phone: +92 302 2222363<br>
            Email: info@raisc.org
            </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 14px;">
            Best regards,<br>
            The RAISC Team<br>
            "Healing takes time, asking for help is a courageous step"
            </p>
        </div>
        </div>
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
