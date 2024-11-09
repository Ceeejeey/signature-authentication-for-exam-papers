require('dotenv').config();

const express = require('express');
const { pool , checkConnection} = require('./config/config');
const bodyParser = require("body-parser");
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors'); 

// Initialize express app
const app = express();

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true // if you’re sending cookies with requests
  }));

// Use routes
app.use("/api", require("./controllers/authController"));

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
