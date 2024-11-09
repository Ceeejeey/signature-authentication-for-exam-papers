const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/config');
const bcrypt = require('bcryptjs');

// Sign-up logic
router.post('/signup', async (req, res) => {
    const { name, email, department, position, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (name, email, password, department, position) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, department, position]
        );
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Error while signing up' });
    }
});

// Sign-in logic
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const existingRefreshToken = req.cookies.refreshToken;

        if (existingRefreshToken) {
            try {
                const decoded = jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);
                return res.json({ accessToken: existingRefreshToken, user });
            } catch (err) {
                console.log('Invalid or expired refresh token, issuing a new one...');
            }
        }

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name, department: user.department, position: user.position },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name, department: user.department, position: user.position },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.json({ accessToken, user, message: 'Sign-in successful' });

    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'An error occurred during sign-in' });
    }
});

module.exports = router;
