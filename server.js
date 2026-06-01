const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend(process.env.RESEND_API_KEY);

// store OTP data
const otpStore = {};

// ⏳ CONFIG
const OTP_EXPIRY_MS = 2 * 60 * 1000; // 2 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const now = Date.now();

  // cooldown check
  if (
    otpStore[email]?.lastSent &&
    now - otpStore[email].lastSent < RESEND_COOLDOWN_MS
  ) {
    return res.json({
      success: false,
      message: "Please wait before requesting another OTP"
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = {
    otp,
    expiresAt: now + OTP_EXPIRY_MS,
    lastSent: now
  };

  try {
    await resend.emails.send({
  from: "OTP Service <onboarding@resend.dev>",
  to: email,
  subject: "Welcome — Your verification code",
  html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hello 👋</h2>

      <p>Thank you for using our service.</p>

      <p>Your verification code is:</p>

      <h1 style="letter-spacing: 4px;">${otp}</h1>

      <p>This code will expire in 2 minutes.</p>

      <br>

      <p>If you did not request this, you can ignore this email.</p>

      <br>

      <p>— Support Team</p>
    </div>
  `  `
    });

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];

  if (!record) {
    return res.json({ success: false, message: "No OTP requested" });
  }

  // check expiry
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.json({ success: false, message: "OTP expired" });
  }

  // check match
  if (record.otp == otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "Verified" });
  }

  res.json({ success: false, message: "Wrong OTP" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("OTP server running on port " + PORT);
});
});
