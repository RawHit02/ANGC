const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sanitize DATABASE_URL - remove channel_binding which pg doesn't support
let dbUrl = process.env.DATABASE_URL || '';
dbUrl = dbUrl.replace(/[&?]channel_binding=[^&]*/g, '');

// Database Setup (Neon PostgreSQL)
const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

// Health check - debug endpoint
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ status: 'ok', time: result.rows[0].now, dbUrl: dbUrl ? 'SET' : 'NOT SET' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message, dbUrl: dbUrl ? 'SET' : 'NOT SET' });
    }
});

// Initialize Tables
let dbInitialized = false;
async function initDB() {
    if (dbInitialized) return;
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS visits (
            id SERIAL PRIMARY KEY,
            ip TEXT,
            user_agent TEXT,
            path TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        await pool.query(`CREATE TABLE IF NOT EXISTS contacts (
            id SERIAL PRIMARY KEY,
            first_name TEXT,
            last_name TEXT,
            email TEXT,
            phone TEXT,
            company TEXT,
            country TEXT,
            college TEXT,
            study_field TEXT,
            subject TEXT,
            message TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS first_name TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_name TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS country TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS college TEXT');
        await pool.query('ALTER TABLE contacts ADD COLUMN IF NOT EXISTS study_field TEXT');

        dbInitialized = true;
        console.log('Neon DB tables initialized.');
    } catch (err) {
        console.error('DB init error:', err.message);
    }
}

// --- Authentication Endpoints ---

app.post('/api/auth/signup', async (req, res) => {
    await initDB();
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, password]);
        res.json({ success: true, message: 'Account created successfully!' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ success: false, message: 'Username or Email already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    await initDB();
    const { email, password } = req.body;
    
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        const user = result.rows[0];
        
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
        
        res.json({ success: true, user: { username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/users', async (req, res) => {
    await initDB();
    try {
        const result = await pool.query('SELECT id, username, email, timestamp FROM users ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/log-visit', async (req, res) => {
    await initDB();
    const { path } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
        const result = await pool.query('INSERT INTO visits (ip, user_agent, path) VALUES ($1, $2, $3) RETURNING id', [ip, userAgent, path]);
        res.json({ status: 'success', id: result.rows[0].id });
    } catch (err) {
        console.error('Logging error:', err.message);
        res.status(500).json({ status: 'error' });
    }
});

app.post('/api/contact', async (req, res) => {
    await initDB();
    const { firstName, lastName, email, phone, company, country, college, studyField, subject, message } = req.body;

    try {
        // 1. Store in Neon DB
        const result = await pool.query(
            'INSERT INTO contacts (first_name, last_name, email, phone, company, country, college, study_field, subject, message) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
            [firstName, lastName, email, phone, company, country, college, studyField, subject, message]
        );
        
        // 2. Forward to FormSubmit.co for email notification
        try {
            const mailResponse = await fetch('https://formsubmit.co/ajax/rohitroody47@gmail.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _subject: `New ${subject || 'Inquiry'}: ${firstName} ${lastName}`,
                    name: `${firstName} ${lastName}`,
                    email,
                    phone,
                    company,
                    country,
                    college,
                    studyField,
                    message,
                    _template: 'table',
                    _captcha: 'false'
                })
            });
            const mailResult = await mailResponse.json();
            console.log('✅ Email forward status:', mailResult.success ? 'Success' : 'Failed');
            if (mailResult.message) console.log('💬 FormSubmit message:', mailResult.message);
        } catch (mailErr) {
            console.error('⚠️ Email forwarding failed:', mailErr.message);
        }

        res.json({ status: 'success', id: result.rows[0].id });
    } catch (err) {
        console.error('Error handling contact form:', err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/logs', async (req, res) => {
    await initDB();
    try {
        const result = await pool.query('SELECT * FROM visits ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/contacts', async (req, res) => {
    await initDB();
    try {
        const result = await pool.query('SELECT * FROM contacts ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
