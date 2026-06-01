app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  console.log("📩 Email received:", email);
  console.log("🔢 OTP generated:", otp);

  try {
    const response = await resend.emails.send({
      from: "OTP Service <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP Code",
      html: `<h1>Your OTP is ${otp}</h1>`
    });

    console.log("✅ Resend response:", response);

    return res.json({ success: true, message: "OTP sent" });

  } catch (err) {
    console.log("❌ Resend error:", err);
    return res.json({ success: false, error: err.message });
  }
});
