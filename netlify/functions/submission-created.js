/**
 * Netlify Function: submission-created
 * Triggered automatically whenever a Netlify Form submission is received.
 * Forwards the contact form data to orders@honeylightcreations.com.
 */

const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  try {
    const payload = JSON.parse(event.body).payload;

    // Only handle the contact form
    if (payload.form_name !== 'contact') {
      return { statusCode: 200, body: 'Ignored (not contact form)' };
    }

    const { name, email, subject, message } = payload.data;

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"HoneyLight Creations" <${process.env.SMTP_USER}>`,
      to: 'orders@honeylightcreations.com',
      replyTo: `"${name}" <${email}>`,
      subject: `Contact Form: ${subject || 'New Message'}`,
      text: `
New contact form submission from honeylightcreations.com

Name:    ${name}
Email:   ${email}
Subject: ${subject}

Message:
${message}
      `.trim(),
      html: `
        <h2 style="color:#b6215a;">New Contact Form Submission</h2>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:15px;">
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#555;">Name</td><td>${name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#555;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold;color:#555;">Subject</td><td>${subject}</td></tr>
        </table>
        <hr style="margin:1.25rem 0;border:none;border-top:1px solid #eee;">
        <p style="font-weight:bold;color:#555;margin-bottom:0.5rem;">Message:</p>
        <p style="white-space:pre-wrap;font-family:sans-serif;font-size:15px;">${message}</p>
        <hr style="margin:1.25rem 0;border:none;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#aaa;">Sent from the contact form at honeylightcreations.com</p>
      `,
    });

    return { statusCode: 200, body: 'Email sent' };
  } catch (error) {
    console.error('submission-created error:', error);
    return { statusCode: 500, body: error.message };
  }
};
