// app/api/register/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

/** ========= Zoho Helpers ========= **/
const ZOHO_TOKEN_URL = (dc: string) => `https://accounts.zoho.${dc}/oauth/v2/token`;
const ZOHO_MAIL_SEND_URL = (accountId: string) =>
  `https://mail.zoho.com/api/accounts/${accountId}/messages`;

async function getZohoAccessToken() {
  const dc = process.env.ZOHO_DC || "com";
  const clientId = process.env.ZOHO_CLIENT_ID || "";
  const clientSecret = process.env.ZOHO_CLIENT_SECRET || "";
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN || "";

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Zoho OAuth env vars (ZOHO_CLIENT_ID/ZOHO_CLIENT_SECRET/ZOHO_REFRESH_TOKEN).");
  }

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(ZOHO_TOKEN_URL(dc), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Zoho token error: ${res.status} ${txt}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("No access_token from Zoho");
  return json.access_token!;
}

function firstName(name: string) {
  return (name || "").trim().split(/\s+/)[0] || "there";
}
function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** ========= Route ========= **/
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      username,
      email,
      password,
      user_type, // "patient" | "doctor"
      // doctor-only fields (optional if user_type=patient)
      doctor_profile = {},
    } = body || {};

    if (!username || !email || !password || !user_type) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }
    if (!["patient", "doctor"].includes(user_type)) {
      return NextResponse.json({ message: "Invalid user type." }, { status: 400 });
    }

    const full_name = String(username).trim();
    const sanitizedEmail = String(email).trim().toLowerCase();

    const base = process.env.NEXT_PUBLIC_DJANGO_BASE_URL;
    if (!base) {
      return NextResponse.json({ message: "Backend base URL is not configured." }, { status: 500 });
    }

    // Prepare request to Django new-register
    const payload: any = {
      full_name,
      email: sanitizedEmail,
      password,
      user_type,
    };
    if (user_type === "doctor") {
      // Forward a normalized doctor_profile to backend
      payload.doctor_profile = {
        display_name: doctor_profile.display_name ?? full_name,
        specialization: doctor_profile.specialization ?? "",
        location: doctor_profile.location ?? "",
        experience: doctor_profile.experience ?? "",
        education: doctor_profile.education ?? "",
        expertise: Array.isArray(doctor_profile.expertise)
          ? doctor_profile.expertise
          : String(doctor_profile.expertise || "")
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean),
        profile_image: doctor_profile.profile_image ?? "",
        rating: Number(doctor_profile.rating ?? 0),
        rates: String(doctor_profile.rates ?? "0"),
      };
    }

    // 1) Simple register (now with user_type and optional doctor_profile)
    const registerRes = await fetch(`${base}/users/new-register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const registerData = await registerRes.json().catch(() => ({}));
    if (!registerRes.ok) {
      const msg = registerData?.message || registerData?.detail || "Registration failed.";
      return NextResponse.json({ message: msg }, { status: registerRes.status });
    }

    // 2) Login to get token (email-based login supported by your backend)
    const loginRes = await fetch(`${base}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: sanitizedEmail, password }),
    });
    const loginData = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok || !loginData?.token) {
      return NextResponse.json({ message: "Registration done, but auto-login failed." }, { status: 201 });
    }
    const token = loginData.token as string;

    // 3) Post-register patch:
    // - For patients: set user_type=patient + create/ensure patient_profile(level=0)
    // - For doctors: new-register already created doctor profile; no patch needed
    if (user_type === "patient") {
      const patchRes = await fetch(`${base}/users/user/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          user_type: "patient",
          patient_profile: { level: 0 },
        }),
      });
      await patchRes.json().catch(() => ({})); // best-effort; do not fail overall
    }

    /** ========= Emails (Zoho) ========= **/
    const ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID || "";
    const FROM = process.env.EMAIL_FROM || "";
    const ADMIN_TO = process.env.CONTACT_RECIPIENT_EMAIL || "info@raisc.org";
    const REPLY_TO = process.env.EMAIL_REPLY_TO || "info@raisc.org";

    let emailSent = false;
    if (ACCOUNT_ID && FROM) {
      try {
        const accessToken = await getZohoAccessToken();

        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3CA7; text-align: center;">New User Registered</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Name:</strong> ${escapeHtml(full_name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
              <p><strong>User Type:</strong> ${escapeHtml(user_type)}</p>
            </div>
          </div>
        `;

        const userHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3CA7; text-align: center;">Welcome to RAISC</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p>Dear ${escapeHtml(firstName(full_name))},</p>
              <p>Your account has been created successfully. You can now log in and begin your journey.</p>
            </div>
          </div>
        `;

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        };

        const mkBody = (to: string, subject: string, html: string) =>
          JSON.stringify({
            fromAddress: FROM,
            toAddress: to,
            subject,
            content: html,
            mailFormat: "html",
            replyTo: REPLY_TO,
          });

        const [adminRes, userRes] = await Promise.all([
          fetch(ZOHO_MAIL_SEND_URL(ACCOUNT_ID), {
            method: "POST",
            headers,
            body: mkBody(ADMIN_TO, `New User Registration - ${full_name}`, adminHtml),
          }),
          fetch(ZOHO_MAIL_SEND_URL(ACCOUNT_ID), {
            method: "POST",
            headers,
            body: mkBody(sanitizedEmail, "Welcome to RAISC", userHtml),
          }),
        ]);

        emailSent = adminRes.ok && userRes.ok;
      } catch (e) {
        console.error("Zoho email error:", e);
      }
    }

    return NextResponse.json(
      {
        message: emailSent
          ? "Registration successful. Confirmation email sent."
          : "Registration successful. Email could not be sent at this time.",
        data: registerData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
