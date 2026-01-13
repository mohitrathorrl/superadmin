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
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>OTP Verification</title>
</head>

<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:14px;overflow:hidden;
          box-shadow:0 10px 30px rgba(0,0,0,0.08);margin:40px 0;">

          <!-- Image Section -->
          <tr>
            <td align="center" style="padding:30px 0;position:relative;">

              <!-- Image -->
              <img
                src="https://res.cloudinary.com/dunkn0qtu/image/upload/v1767859194/otpotp_h5wh6v.png"
                alt="OTP Verification"
                width="260"
                style="display:block;"
              />

              <!-- OTP Popup -->
              <div
                style="
                  background:#ffffff;
                  border:2px solid #000;
                  border-radius:12px;
                  padding:14px 26px;
                  font-size:26px;
                  font-weight:bold;
                  letter-spacing:6px;
                  color:#000;
                  margin-top:-40px;
                  display:inline-block;
                  box-shadow:0 6px 16px rgba(0,0,0,0.15);
                "
              >
                {{OTP}}
              </div>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="center" style="padding:20px 40px 10px;">
              <h2 style="margin:0;color:#333;">Verify Your Login</h2>
              <p style="font-size:15px;color:#555;line-height:1.6;">
                Use the One-Time Password below to complete your login.
                This OTP is valid for <b>5 minutes</b>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:16px;background:#fafafa;
              font-size:12px;color:#999;">
              © 2025 <b>Super Admin Panel</b>. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    `,
  })
}

