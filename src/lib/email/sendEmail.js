// lib/email/sendEmail.js - Email Sending Service
import nodemailer from 'nodemailer';
import { getOTPEmailTemplate } from './emailTemplates';

const transporter = nodemailer.createTransporter({
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
      text: `Hello ${userName},\n\nYour RupeeLending verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    
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