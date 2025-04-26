const express = require('express');
const app = express();
require('dotenv').config();
const OtpRoutes = require('./routes/OtpRoutes');

const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api', OtpRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
