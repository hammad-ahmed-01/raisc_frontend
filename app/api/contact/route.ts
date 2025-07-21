import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { firstName, lastName, email, phone, message } = body;

    // Comprehensive validation for all fields
    const errors: string[] = [];

    // First Name validation
    if (!firstName || !firstName.trim()) {
      errors.push('First name is required');
    } else if (firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    } else if (firstName.trim().length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    // Last Name validation
    if (!lastName || !lastName.trim()) {
      errors.push('Last name is required');
    } else if (lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    } else if (lastName.trim().length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    // Email validation
    if (!email || !email.trim()) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Phone validation (now mandatory)
    if (!phone || !phone.trim()) {
      errors.push('Phone number is required');
    } else {
      const phoneRegex = /^(\+92|92|0)?[0-9]{10,11}$/;
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        errors.push('Please enter a valid Pakistani phone number');
      }
    }

    // Message validation
    if (!message || !message.trim()) {
      errors.push('Message is required');
    } else if (message.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    } else if (message.trim().length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    // Environment variables validation
    if (!process.env.ZOHO_EMAIL || !process.env.ZOHO_PASSWORD || !process.env.CONTACT_RECIPIENT_EMAIL) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Sanitize input data
    const sanitizedData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim()
    };

    // Create Zoho transporter
    const transporter = nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST,
      port: parseInt(process.env.ZOHO_SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('SMTP configuration error:', verifyError);
      return NextResponse.json(
        { error: 'Email service configuration error' },
        { status: 500 }
      );
    }

    // Email content for your team
    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: process.env.CONTACT_RECIPIENT_EMAIL,
      subject: `New Contact Form Submission from ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1E3CA7; text-align: center;">New Contact Form Submission</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details:</h3>
            <p><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 6px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="line-height: 1.6; color: #555;">${sanitizedData.message}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #888; font-size: 14px;">
              This email was sent from the RAISC contact form.
            </p>
          </div>
        </div>
      `,
    };

    // Auto-response email for the user
    const autoResponseOptions = {
      from: process.env.ZOHO_EMAIL,
      to: sanitizedData.email,
      subject: 'Thank you for contacting RAISC - We\'ve received your message',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #1E3CA7; text-align: center;">Thank You for Contacting RAISC</h2>
          
          <div style="text-align: center; margin: 30px 0;">
            <img src="https://your-domain.com/logo.png" alt="RAISC Logo" style="max-width: 150px;" />
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p>Dear ${sanitizedData.firstName},</p>
            <p>Thank you for reaching out to RAISC. We have successfully received your message and our team will review it shortly.</p>
            <p>We appreciate your interest in our mental health services and will get back to you within 24-48 hours.</p>
          </div>

          <div style="background-color: #e9f5fe; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #1E3CA7; margin-top: 0;">Your Message Summary:</h4>
            <p><strong>Name:</strong> ${sanitizedData.firstName} ${sanitizedData.lastName}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            <p><strong>Phone:</strong> ${sanitizedData.phone}</p>
            <p><strong>Message:</strong> ${sanitizedData.message.substring(0, 100)}${sanitizedData.message.length > 100 ? '...' : ''}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666;">
              If you have any urgent concerns, please don't hesitate to call us directly.
            </p>
            <p style="color: #1E3CA7; font-weight: bold;">
              Phone: +92 XXX XXXXXXX<br>
              Email: contact@raisc.com
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

    // Send both emails
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoResponseOptions);

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
