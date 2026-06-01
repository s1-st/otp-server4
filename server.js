const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔑 Get key from Render environment
const resend = new Resend(process.env.RESEND_API_KEY);

// store OTPs temporarily
const otpStore = {};

// SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "Verified" });
  }

  res.json({ success: false, message: "Wrong OTP" });
});

// START SERVER
app.listen(3000, () => {
  console.log("OTP server running");
});
