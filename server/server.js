const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- Authentication Endpoints ---

// Signup Endpoint
app.post('/api/auth/signup', (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ success: false, message: 'Username or Email already exists' });
            }
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: 'Account created successfully!' });
    });
});

// Login Endpoint
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
        
        res.json({ success: true, user: { username: user.username, email: user.email } });
    });
});

// Get all users (Admin only)
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, email, timestamp FROM users ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Serve Frontend Static Files (from parent directory)
app.use(express.static(path.join(__dirname, '..')));

// Database Setup
const dbPath = path.join(__dirname, 'visitors.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip TEXT,
            user_agent TEXT,
            path TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Migrating existing DB if 'subject' is missing
            db.all("PRAGMA table_info(contacts)", (err, rows) => {
                if (!err && !rows.find(r => r.name === 'subject')) {
                    db.run("ALTER TABLE contacts ADD COLUMN subject TEXT");
                }
            });
        });

        // Users table for authentication
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Logging Endpoint
app.post('/api/log-visit', (req, res) => {
    const { path } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const query = `INSERT INTO visits (ip, user_agent, path) VALUES (?, ?, ?)`;
    db.run(query, [ip, userAgent, path], function(err) {
        if (err) {
            console.error('Logging error:', err.message);
            return res.status(500).json({ status: 'error' });
        }
        res.json({ status: 'success', id: this.lastID });
    });
});

// Contact form endpoint for local storage
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    
    console.log('\n--- 📩 New Contact Message ---');
    console.log(`Time:    ${new Date().toLocaleString()}`);
    console.log(`Name:    ${name}`);
    console.log(`Email:   ${email}`);
    console.log(`Subject: ${subject || 'N/A'}`);
    console.log(`Message: ${message}`);
    console.log('-----------------------------\n');

    db.run('INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)', [name, email, subject, message], function(err) {
        if (err) {
            console.error('❌ Database Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ status: 'success', id: this.lastID });
    });
});

app.get('/api/logs', (req, res) => {
    db.all(`SELECT * FROM visits ORDER BY timestamp DESC LIMIT 100`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/contacts', (req, res) => {
    db.all(`SELECT * FROM contacts ORDER BY timestamp DESC LIMIT 100`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
