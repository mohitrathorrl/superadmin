// import nodemailer from "nodemailer"

// export const mailer = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   auth: {
//     user:"rathormohit547@gmail.com",   
//     pass:   "kywv mtis tisn ybqx"  
//   },
// })


// export async function sendOTPEmail({ to, otp, role }) {
//   await mailer.sendMail({
//     from: `"super admin" <${process.env.MAIL_USER}>`,
//     to,
//     subject: "Your Login OTP",
//     html: `
//       <div style="font-family:Arial;line-height:1.6">
//         <h2>Secure Login</h2>
//         <p>You are trying to login as <b>${role.toUpperCase()}</b></p>
//         <p>Your OTP is:</p>
//         <h1 style="letter-spacing:4px">${otp}</h1>
//         <p>This OTP is valid for <b>5 minutes</b>.</p>
//         <hr/>
//         <p style="font-size:12px;color:#666">
//           If this was not you, please ignore this email.
//         </p>
//       </div>
//     `,
//   })
// }


import nodemailer from "nodemailer"

export const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "it@rupeelending.com",
    pass: "zgwy yptg isge ugvd", // Gmail App Password
  },
})

export async function sendOTPEmail({ to, otp, role }) {
  await mailer.sendMail({
    from: `"Super Admin Login" <it@rupeelending.com>`,
    to,
    subject: "🔐 Your Login OTP",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: Arial, Helvetica, sans-serif;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
    .hero img {
      width: 100%;
      display: block;
    }
    .content {
      padding: 24px;
      text-align: center;
      color: #333333;
    }
    .content h2 {
      margin: 0 0 10px;
      color: #333333;
    }
    .content p {
      font-size: 15px;
      margin: 8px 0;
      line-height: 1.6;
    }
    .otp-box {
      margin: 20px auto;
      display: inline-block;
      padding: 14px 30px;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: bold;
      color: black;
      background: #ebf2ef;
      border: 2px dashed black;
      border-radius: 10px;
    }
    .note {
      font-size: 13px;
      color: #666666;
      margin-top: 14px;
    }
    .footer {
      padding: 16px;
      background: #fafafa;
      text-align: center;
      font-size: 12px;
      color: #999999;
    }
    @media (max-width: 480px) {
      .otp-box {
        font-size: 24px;
        padding: 12px 20px;
      }
    }
  </style>
</head>
<body>

  <div class="container">

    <div class="hero">
      <img
        src="https://res.cloudinary.com/dunkn0qtu/image/upload/v1766146164/1766145983809-removebg-preview_dvs15x.png"
        alt="Secure Login"
      />
    </div>

    <div class="content">
      <h2>Verify Your Login</h2>

      <p>Hello 👋</p>
      <p>Your One-Time Password (OTP) is:</p>
      <div class="otp-box">${otp}</div>

      
    </div>

    <div class="footer">
      © 2025 <b>Super Admin Panel</b>. All rights reserved.
    </div>

  </div>

</body>
</html>
    `,
  })
}

