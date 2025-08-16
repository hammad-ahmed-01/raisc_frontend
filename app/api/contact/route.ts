// app/api/contact/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // Vercel-friendly (no Node-only deps)

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

/* ---------- Zoho helpers ---------- */
const tokenUrl = (dc = "com") => `https://accounts.zoho.${dc}/oauth/v2/token`;
const mailHost = (dc = "com") =>
  ({ eu: "mail.zoho.eu", in: "mail.zoho.in", jp: "mail.zoho.jp", au: "mail.zoho.com.au", sa: "mail.zoho.sa", ca: "mail.zoho.ca" } as any)[dc] || "mail.zoho.com";
const messagesUrl = (accountId: string, dc?: string) => `https://${mailHost(dc)}/api/accounts/${accountId}/messages`;

async function getZohoAccessToken() {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.ZOHO_CLIENT_ID || "",
    client_secret: process.env.ZOHO_CLIENT_SECRET || "",
    refresh_token: process.env.ZOHO_REFRESH_TOKEN || "",
  });
  const res = await fetch(tokenUrl(process.env.ZOHO_DC), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`Zoho token error ${res.status}: ${await res.text()}`);
  const j = await res.json();
  if (!j.access_token) throw new Error("No access_token from Zoho");
  return j.access_token as string;
}

function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* ---------- Route ---------- */
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { firstName, lastName, email, phone, message } = body;

    // Comprehensive validation for all fields
    const errors: string[] = [];

    // First Name validation
    if (!firstName || !firstName.trim()) {
      errors.push("First name is required");
    } else if (firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    } else if (firstName.trim().length > 50) {
      errors.push("First name must be less than 50 characters");
    }

    // Last Name validation
    if (!lastName || !lastName.trim()) {
      errors.push("Last name is required");
    } else if (lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    } else if (lastName.trim().length > 50) {
      errors.push("Last name must be less than 50 characters");
    }

    // Email validation
    if (!email || !email.trim()) {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Please enter a valid email address");
      }
    }

    // Phone validation (Pakistani format, mandatory)
    if (!phone || !phone.trim()) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^(\+92|92|0)?[0-9]{10,11}$/;
      const cleanPhone = phone.replace(/[\s-]/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        errors.push("Please enter a valid Pakistani phone number");
      }
    }

    // Message validation
    if (!message || !message.trim()) {
      errors.push("Message is required");
    } else if (message.trim().length < 10) {
      errors.push("Message must be at least 10 characters");
    } else if (message.trim().length > 1000) {
      errors.push("Message must be less than 1000 characters");
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Sanitize input data
    const sanitized = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
    };

    // Required envs for Zoho HTTP API
    const ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID;
    const FROM = process.env.EMAIL_FROM; // must be a valid sender for ACCOUNT_ID
    const ADMIN_TO = process.env.CONTACT_RECIPIENT_EMAIL;

    if (!ACCOUNT_ID || !FROM || !process.env.ZOHO_CLIENT_ID || !process.env.ZOHO_CLIENT_SECRET || !process.env.ZOHO_REFRESH_TOKEN) {
      console.error("Missing Zoho envs (ACCOUNT_ID/EMAIL_FROM/CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN)");
      return NextResponse.json({ error: "Email service configuration error" }, { status: 500 });
    }

    // Build HTML emails
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1E3CA7; text-align: center;">New Contact Form Submission</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
          <p><strong>Name:</strong> ${escapeHtml(sanitized.firstName)} ${escapeHtml(sanitized.lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitized.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(sanitized.phone)}</p>
        </div>
        <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
          <h3 style="color: #333; margin-top: 0;">Message:</h3>
          <p style="line-height: 1.6; color: #555;">${escapeHtml(sanitized.message)}</p>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #888; font-size: 14px;">This email was sent from the RAISC contact form.</p>
        </div>
      </div>
    `;

    const userHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1E3CA7; text-align: center;">Thank You for Contacting RAISC</h2>
        <div style="text-align: center; margin: 30px 0;">
          <img src="https://raisc.org/raisc-logo.png" alt="RAISC Logo" style="max-width: 150px;" />
        </div>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <p>Dear ${escapeHtml(sanitized.firstName)},</p>
          <p>Thank you for reaching out to RAISC. We have successfully received your message and our team will review it shortly.</p>
          <p>We appreciate your interest in our mental health services. We will notify you once RAISC is live. Thank you for your confidence in us.</p>
        </div>
        <div style="background-color: #e9f5fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="color: #1E3CA7; margin-top: 0;">Your Message Summary:</h4>
          <p><strong>Name:</strong> ${escapeHtml(sanitized.firstName)} ${escapeHtml(sanitized.lastName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitized.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(sanitized.phone)}</p>
          <p><strong>Message:</strong> ${escapeHtml(sanitized.message.length > 100 ? sanitized.message.substring(0, 100) + "..." : sanitized.message)}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666;">If you have any urgent concerns, please don't hesitate to call us directly.</p>
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
    `;

    // Send both emails via Zoho HTTP API (only documented keys)
    const accessToken = await getZohoAccessToken();
    const headers = {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const url = messagesUrl(ACCOUNT_ID, process.env.ZOHO_DC);

    const adminBody = {
      fromAddress: FROM,
      toAddress: ADMIN_TO || "info@raisc.org",
      subject: `New Contact Form Submission from ${sanitized.firstName} ${sanitized.lastName}`,
      content: adminHtml,
      mailFormat: "html" as const,
    };

    const userBody = {
      fromAddress: FROM,
      toAddress: sanitized.email,
      subject: "Thank you for contacting RAISC - We've received your message",
      content: userHtml,
      mailFormat: "html" as const,
    };

    const [adminRes, userRes] = await Promise.all([
      fetch(url, { method: "POST", headers, body: JSON.stringify(adminBody) }),
      fetch(url, { method: "POST", headers, body: JSON.stringify(userBody) }),
    ]);

    if (!adminRes.ok || !userRes.ok) {
      console.error("Zoho send failed", { adminStatus: adminRes.status, userStatus: userRes.status, url });
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Contact form submitted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
