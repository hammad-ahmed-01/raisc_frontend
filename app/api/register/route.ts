import { NextResponse } from "next/server";

export const runtime = "edge"; // works on Vercel (no Node-only deps)

/** ========= Helpers ========= **/

const ZOHO_TOKEN_URL = (dc: string) => `https://accounts.zoho.${dc}/oauth/v2/token`;
const ZOHO_MAIL_SEND_URL = (accountId: string) =>
  `https://mail.zoho.com/api/accounts/${accountId}/messages`;

async function getZohoAccessToken() {
  const dc = process.env.ZOHO_DC || "com";
  const clientId = process.env.ZOHO_CLIENT_ID || "";
  const clientSecret = process.env.ZOHO_CLIENT_SECRET || "";
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN || "";

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Zoho OAuth env vars (ZOHO_CLIENT_ID/SECRET/REFRESH_TOKEN).");
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
  return json.access_token;
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
    const { username, email, password } = await request.json();

    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const full_name = String(username).trim();
    const sanitizedEmail = String(email).trim().toLowerCase();

    // Send data to Django backend
    const backendUrl = `${process.env.NEXT_PUBLIC_DJANGO_BASE_URL}/users/new-register/`;
    const djangoResponse = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email: sanitizedEmail, password }),
    });

    const data = await djangoResponse.json().catch(() => ({}));
    if (!djangoResponse.ok) {
      return NextResponse.json(
        { message: (data && (data.message || data.detail)) || "Registration failed." },
        { status: djangoResponse.status }
      );
    }

    // Email via Zoho Mail HTTP API
    const ACCOUNT_ID = process.env.ZOHO_ACCOUNT_ID; // e.g., "4916816...."
    const FROM = process.env.EMAIL_FROM;            // must be a valid sender for this account
    const ADMIN_TO = process.env.CONTACT_RECIPIENT_EMAIL || "info@raisc.org";
    const REPLY_TO = "info@raisc.org";              // safe default for replies

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
            </div>
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
              <p style="color: #888; font-size: 14px;">
                This is an automated notification from the RAISC registration system.
              </p>
            </div>
          </div>
        `;

        const userHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #1E3CA7; text-align: center;">Welcome to RAISC</h2>
            <div style="text-align: center; margin: 30px 0;">
              <img src="https://raisc.org/raisc-logo.png" alt="RAISC Logo" style="max-width: 150px;" />
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p>Dear ${escapeHtml(firstName(full_name))},</p>
              <p>Thank you for registering with RAISC. Your account has been successfully created.</p>
              <p>We are excited to have you on board and will keep you updated about new features and services.</p>
            </div>
            <div style="background-color: #e9f5fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="color: #1E3CA7; margin-top: 0;">Your Registration Details:</h4>
              <p><strong>Name:</strong> ${escapeHtml(full_name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(sanitizedEmail)}</p>
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
        `;

        const makeBody = (to: string, subject: string, html: string) =>
          JSON.stringify({
            fromAddress: FROM,
            toAddress: to,
            subject,
            content: html,
            mailFormat: "html",
          });

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Zoho-oauthtoken ${accessToken}`,
        };

        const [adminRes, userRes] = await Promise.all([
          fetch(ZOHO_MAIL_SEND_URL(ACCOUNT_ID), {
            method: "POST",
            headers,
            body: makeBody(ADMIN_TO, `New User Registration - ${full_name}`, adminHtml),
          }),
          fetch(ZOHO_MAIL_SEND_URL(ACCOUNT_ID), {
            method: "POST",
            headers,
            body: makeBody(sanitizedEmail, "Welcome to RAISC - Registration Successful", userHtml),
          }),
        ]);

        emailSent = adminRes.ok && userRes.ok;
        if (!emailSent) {
          console.error("Zoho send failed", {
            adminStatus: adminRes.status,
            userStatus: userRes.status,
          });
        }
      } catch (e) {
        console.error("Zoho email error:", e);
      }
    } else {
      console.error("Missing EMAIL_FROM or ZOHO_ACCOUNT_ID envs");
    }

    return NextResponse.json(
      {
        message: emailSent
          ? "Registration successful. Confirmation email sent."
          : "Registration successful. Email could not be sent at this time.",
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}