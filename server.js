const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Resend } = require("resend");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const resend = new Resend(process.env.RESEND_API_KEY);

const otpStore = {};

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await resend.emails.send({
      from: "OTP Service <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP Code",
      html: `<h1>${otp}</h1><p>Expires in 2 minutes</p>`
    });

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "Verified" });
  }

  res.json({ success: false, message: "Wrong OTP" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
