
const express = require('express');

const twilio = require('twilio');
require('dotenv').config();

const PORT = 8080;

const app = express();
app.use(express.json());

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// hold phone number OTP
const otpStore = {};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}



app.post('/api/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    const toNumber = phoneNumber || process.env.TWILIO_TO_NUMBER;
    const otp = generateOTP();

    try {

        otpStore[toNumber] = otp;

        const response = await client.messages.create({
            body: ` Your OTP is : ${otp} `,
            from: process.env.TWILIO_FROM_NUMBER,
            to: toNumber,
        });

        res.status(200).json({ message: ` Otp is : ${otp}` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send Otp " });

    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    const storedOtp = otpStore[phoneNumber];
    if (!storedOtp) {
        return res.status(400).json({ message: "OTP is Not valid" });
    }

    if (parseInt(otp) === storedOtp) {
        delete otpStore[phoneNumber]; // remove the otp from temporary variable.
        return res.status(200).json({ message: "OTP Verified Successfully" });
    }
    else {
        return res.status(400).json({ message: "Invalid OTP" });

    }

});

app.listen(PORT, () => {
    console.log(`Message is send Successfully... `)
});
