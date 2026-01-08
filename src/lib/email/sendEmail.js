// lib/email/sendEmail.js - Email Sending Service (FIXED)
import nodemailer from 'nodemailer';
import { getOTPEmailTemplate } from './emailTemplates.js';

// ✅ FIXED: Use createTransport (not createTransporter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendOTPEmail(email, otp, userName = 'User') {
  try {
    const htmlContent = getOTPEmailTemplate(otp, userName);

    const mailOptions = {
      from: {
        name: 'RupeeLending',
        address: process.env.EMAIL_USER,
      },
      to: email,
      subject: `🔐 Your Verification Code: ${otp}`,
      html: htmlContent,
      text: `Hello ${userName},\n\nYour RupeeLending verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.\n\n© ${new Date().getFullYear()} RupeeLending. All rights reserved.`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export default transporter;
