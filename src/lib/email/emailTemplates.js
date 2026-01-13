// lib/email/emailTemplates.js - Clean OTP Email Template
export function getOTPEmailTemplate(otp, userName = "User") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f7fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #333333;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
      text-align: center;
    }

    .card {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 14px;
      padding: 36px 28px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }

    .title {
      font-size: 18px;
      margin-bottom: 12px;
    }

    .text {
      font-size: 15px;
      color: #555555;
      line-height: 1.7;
    }

    .image-box {
      margin: 30px 0 10px;
    }

    .otp-popup {
      display: inline-block;
      margin-top: -36px;
      background: #ffffff;
      border: 2px solid #000000;
      border-radius: 14px;
      padding: 14px 30px;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #000000;
      font-family: "Courier New", monospace;
      box-shadow: 0 8px 18px rgba(0,0,0,0.18);
    }

    .note {
      margin-top: 18px;
      font-size: 13px;
      color: #777777;
    }
  </style>
</head>

<body>

  <div class="wrapper">
    <div class="card">

      <p class="title">Hello <strong>${userName}</strong>,</p>

      <p class="text">
        Use the One-Time Password below to securely verify your login to
        <strong>RupeeLending</strong>.
      </p>

      <div class="image-box">
        <img
          src="https://res.cloudinary.com/dunkn0qtu/image/upload/v1767859194/otpotp_h5wh6v.png"
          alt="OTP Verification"
          width="260"
          style="display:block;margin:0 auto;"
        />
      </div>

      <div class="otp-popup">
        ${otp}
      </div>

      <p class="note">
        This OTP is valid for <strong>10 minutes</strong>.  
        Please do not share it with anyone.
      </p>

    </div>
  </div>

</body>
</html>
  `;
}
