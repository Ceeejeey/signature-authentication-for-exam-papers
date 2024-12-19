require('dotenv').config();

const express = require('express');
const { pool , checkConnection} = require('./config/config');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Initialize express app
const app = express();
const upload = multer({ dest: 'uploads/' }); // File upload destination

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);

// OAuth2 Configuration
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Function to send email
async function sendMail(to, subject, text, attachments) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'gihanvimukthi19@gmail.com', 
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: 'gihanvimukthi19@gmail.com',
      to,
      subject,
      text,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
// Use routes
app.use("/api", require("./controllers/authController"));
// Route for sending PDF email
app.post('/api/send-pdf', upload.single('pdf'), async (req, res) => {
  const { email, message } = req.body;

  // Validate input
  if (!email || !message) {
    return res.status(400).json({ success: false, error: 'Email and message are required.' });
  }

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'PDF file is required.' });
  }

  const filePath = req.file.path;

  try {
    await sendMail(
      email,
      'PDF Document for Signature Request',
      message || 'Please find the attached PDF document.',
      [
        {
          filename: req.file.originalname,
          path: filePath,
        },
      ]
    );

    // Clean up uploaded file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error removing file:', err);
      }
    });

    res.status(200).json({ success: true, message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error while sending email:', error);

    // Clean up uploaded file on error
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error removing file:', err);
      }
    });

    res.status(500).json({ success: false, error: 'Failed to send email.' });
  }
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await checkConnection();
    } catch (error) {
        console.log("Failed to initialize database", error);
    }
});
