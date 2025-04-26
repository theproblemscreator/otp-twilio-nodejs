const express = require('express');
const router = express.Router();
const twilio = require('twilio');
require('dotenv').config();

// Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Temporary store for OTPs
const otpStore = {};

// OTP Generator
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
}

// Send OTP API
router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    const toNumber = phoneNumber || process.env.TWILIO_TO_NUMBER;
    const otp = generateOTP();

    try {
        // Save OTP temporarily
        otpStore[toNumber] = otp;

        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: process.env.TWILIO_FROM_NUMBER,
            to: toNumber,
        });

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
});

// Verify OTP API
router.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    const storedOtp = otpStore[phoneNumber];

    if (!storedOtp) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (parseInt(otp) === storedOtp) {
        delete otpStore[phoneNumber]; // Remove OTP after successful verification
        res.status(200).json({ message: "OTP verified successfully" });
    } else {
        res.status(400).json({ message: "Invalid OTP" });
    }
});

module.exports = router;
