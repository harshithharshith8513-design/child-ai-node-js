require('dotenv').config();
const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const path = require('path');
const bcrypt = require('bcryptjs');
const dbHelper = require('./db');

const app = express();
const PORT = process.env.PORT || 8000;

// Setup JSON and Form URL encoding parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Express Session
app.use(session({
    secret: process.env.DJANGO_SECRET_KEY || 'node-express-secret-key-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Setup CSRF and Custom Messages local middleware
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = require('crypto').randomBytes(16).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    res.locals.messages = req.session.messages || [];
    req.session.messages = [];
    next();
});

// Configure Nunjucks
const nunjucksEnv = nunjucks.configure(path.join(__dirname, 'templates'), {
    autoescape: true,
    express: app,
    noCache: process.env.NODE_ENV !== 'production'
});

// Register template globals and filters
nunjucksEnv.addGlobal('currentYear', new Date().getFullYear());

// Static Files Mounting
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(express.static(path.join(__dirname, 'static')));

// Middleware to ensure user is authenticated
function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
}

// Middleware to ensure user is logged in as admin
function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.username !== 'admin') {
        req.session.messages = ["Access denied. Administrator privileges required."];
        return res.redirect('/login');
    }
    next();
}

// Middleware to redirect authenticated user to app
function redirectIfLoggedIn(req, res, next) {
    if (req.session.user) {
        return res.redirect('/app');
    }
    next();
}

// CSRF check helper
function verifyCsrf(req, res, next) {
    const token = req.body.csrfmiddlewaretoken || req.headers['x-csrftoken'];
    if (!token || token !== req.session.csrfToken) {
        return res.status(403).send("CSRF token verification failed");
    }
    next();
}

// Offline AI assistant logic
function offlineAiBotReply(message) {
    const text = message.toLowerCase();
    if (text.includes("screen time") || text.includes("phone time") || text.includes("device time")) {
        return "A practical screen-time plan starts with a daily limit, device-free meals, and a shared charging place outside the bedroom. Adjust the limit for schoolwork and review the plan with the child each week.";
    }
    if (text.includes("bully") || text.includes("harass") || text.includes("threat")) {
        return "Save evidence without replying, block and report the account, and involve a trusted adult or school contact. If there is an immediate threat, contact local emergency services.";
    }
    if (text.includes("password") || text.includes("account") || text.includes("hack") || text.includes("privacy")) {
        return "Use a unique passphrase, enable two-factor authentication, review app permissions, and avoid sharing personal details such as school, address, phone number, or live location.";
    }
    if (text.includes("stranger") || text.includes("contact") || text.includes("message") || text.includes("chat")) {
        return "Teach the child not to move conversations with strangers to private apps, share images, or agree to meet. Block suspicious contacts and keep calm so the child feels safe reporting uncomfortable messages.";
    }
    if (text.includes("location") || text.includes("lost") || text.includes("missing") || text.includes("emergency")) {
        return "Check the Guardian Dashboard location with permission, call the child and trusted contacts, and verify familiar places. For immediate danger or a missing child, contact local emergency services promptly.";
    }
    return "AI Bot is currently in offline safety mode. I can help with screen time, online privacy, suspicious contacts, cyberbullying, location safety, and family digital rules. Add a Groq API key to enable live web search and broader AI answers.";
}

// Groq chat completions helper
async function requestGroqReply(userMessage, safeHistory) {
    const groqKey = process.env.GROQ_API_KEY || "";
    let groqModel = process.env.GROQ_MODEL || "groq/compound";

    const messages = [
        {
            role: "system",
            content: "You are AI Bot, a concise, family-friendly assistant in ChildGuard AI. Use web search for current, recent, or factual questions that benefit from up-to-date information. Include clickable source URLs in the answer when web tools are used. Give practical digital-safety guidance and never claim to contact emergency services or replace professional advice."
        },
        ...safeHistory,
        { role: "user", content: userMessage }
    ];

    const isOfficialGroq = groqKey.startsWith("gsk_");
    if (isOfficialGroq && groqModel === "groq/compound") {
        groqModel = "llama-3.3-70b-versatile"; // Fallback to standard official Groq model
    }

    const requestBody = {
        model: groqModel,
        messages: messages,
        temperature: 0.6,
        max_tokens: 512
    };

    // Only include custom tools parameters if using the specific compound proxy model
    if (groqModel === "groq/compound") {
        requestBody.compound_custom = {
            tools: {
                enabled_tools: ["web_search", "visit_website"]
            }
        };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json",
            "User-Agent": "ChildGuardAI/1.0"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`Groq API returned status ${response.status}`);
    }

    const payload = await response.json();
    const replyMessage = payload.choices[0].message;
    const executedTools = replyMessage.executed_tools || [];
    const webUsed = executedTools.some(tool => 
        tool && typeof tool === 'object' && ['search', 'web_search', 'visit_website'].includes(tool.type)
    );

    return {
        reply: (replyMessage.content || "").trim(),
        webUsed: webUsed
    };
}

// Route: Landing
app.get('/', (req, res) => {
    res.render('landing.html');
});

// Route: Register
app.get('/register', redirectIfLoggedIn, (req, res) => {
    res.render('register.html');
});

app.post('/register', redirectIfLoggedIn, verifyCsrf, async (req, res) => {
    const {
        username,
        password,
        confirm_password,
        fullname,
        aadhaar_verified,
        aadhaar_name,
        aadhaar_number,
        aadhaar_mobile,
        aadhaar_address,
        aadhaar_dob,
        aadhaar_age
    } = req.body;

    const renderRegisterWithError = (errMsg) => {
        req.session.messages = [errMsg];
        return res.render('register.html', {
            username,
            fullname,
            aadhaar_verified,
            aadhaar_name,
            aadhaar_number,
            aadhaar_mobile,
            aadhaar_address,
            aadhaar_dob,
            aadhaar_age
        });
    };

    if (!username || !password || !fullname) {
        return renderRegisterWithError("Please fill in all basic registration fields.");
    }

    if (username.length < 5) {
        return renderRegisterWithError("Username must be at least 5 characters long.");
    }

    // Password complexity check
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
        return renderRegisterWithError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).");
    }

    if (password !== confirm_password) {
        return renderRegisterWithError("Passwords do not match.");
    }

    if (aadhaar_verified !== "true") {
        return renderRegisterWithError("Aadhaar e-KYC / DigiLocker verification is mandatory.");
    }

    if (!aadhaar_number || aadhaar_number.length !== 12 || !/^\d+$/.test(aadhaar_number)) {
        return renderRegisterWithError("A valid 12-digit Aadhaar number is required.");
    }

    if (!aadhaar_mobile || aadhaar_mobile.length !== 10 || !/^\d+$/.test(aadhaar_mobile)) {
        return renderRegisterWithError("A valid 10-digit Aadhaar linked mobile number is required.");
    }

    if (!aadhaar_dob) {
        return renderRegisterWithError("Aadhaar Date of Birth is required.");
    }

    if (!aadhaar_address || !aadhaar_address.trim()) {
        return renderRegisterWithError("Aadhaar Resident Address is required.");
    }

    // Age restriction
    const age = parseInt(aadhaar_age, 10);
    if (isNaN(age) || age < 18) {
        return renderRegisterWithError(`Guardian account creation denied. You must be at least 18 years old (Age extracted: ${aadhaar_age || 0}).`);
    }

    // Name match (case-insensitive)
    if (fullname.trim().toLowerCase() !== (aadhaar_name || "").trim().toLowerCase()) {
        return renderRegisterWithError(`Registration name '${fullname}' does not match Aadhaar profile name '${aadhaar_name}'.`);
    }

    try {
        const existingUser = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
        if (existingUser) {
            return renderRegisterWithError("Username is already taken.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await dbHelper.run(
            "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
            [username, hashedPassword, fullname]
        );

        // Fetch newly created user and log in
        const newUser = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
        req.session.user = {
            id: newUser.id,
            username: newUser.username,
            fullname: newUser.fullname
        };

        return res.redirect('/app');
    } catch (e) {
        return renderRegisterWithError(`Registration failed: ${e.message}`);
    }
});

// Route: Login
app.get('/login', redirectIfLoggedIn, (req, res) => {
    res.render('login.html', { nextUrl: req.query.next });
});

app.post('/login', redirectIfLoggedIn, verifyCsrf, async (req, res) => {
    const { username, password, next } = req.body;

    try {
        const user = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    fullname: user.fullname
                };
                const nextUrl = next || '/app';
                return res.redirect(nextUrl);
            }
        }
        return res.render('login.html', {
            formErrors: true,
            username: username,
            nextUrl: next
        });
    } catch (e) {
        return res.render('login.html', {
            formErrors: true,
            username: username,
            nextUrl: next
        });
    }
});

// Route: Logout
app.post('/logout', verifyCsrf, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Route: Home
app.get('/app', requireLogin, (req, res) => {
    res.render('home.html', { currentUrlName: 'home', user: req.session.user });
});

// Route: Dashboard
app.get('/dashboard', requireLogin, (req, res) => {
    res.render('dashboard.html', { currentUrlName: 'dashboard', user: req.session.user });
});

// Route: Profile
app.get('/profile', requireLogin, (req, res) => {
    res.render('profile.html', { currentUrlName: 'profile', user: req.session.user });
});

// Route: Resources
app.get('/resources', requireLogin, (req, res) => {
    res.render('resources.html', { currentUrlName: 'resources', user: req.session.user });
});

// Route: About
app.get('/about', requireLogin, (req, res) => {
    res.render('about.html', { currentUrlName: 'about', user: req.session.user });
});

// Route: Gatekeeper Biometric Bypass Page
app.get('/gatekeeper', (req, res) => {
    const domain = req.query.domain || '';
    res.render('gatekeeper.html', { currentUrlName: 'about', user: req.session.user, domain });
});

// Route: Assistant
app.get('/assistant', requireLogin, (req, res) => {
    const groqEnabled = !!process.env.GROQ_API_KEY;
    res.render('assistant.html', {
        currentUrlName: 'assistant',
        user: req.session.user,
        groq_enabled: groqEnabled
    });
});

app.post('/assistant', requireLogin, verifyCsrf, async (req, res) => {
    const userMessage = (req.body.message || "").toString().trim();
    const history = req.body.history || [];

    if (!userMessage) {
        return res.status(400).json({ error: "Please enter a message." });
    }

    if (userMessage.length > 2000) {
        return res.status(400).json({ error: "Please keep messages under 2000 characters." });
    }

    const safeHistory = [];
    if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
            if (item && typeof item === 'object') {
                const role = item.role;
                const content = (item.content || "").toString().trim().substring(0, 2000);
                if (['user', 'assistant'].includes(role) && content) {
                    safeHistory.push({ role, content });
                }
            }
        }
    }

    if (!process.env.GROQ_API_KEY) {
        return res.json({
            reply: offlineAiBotReply(userMessage),
            mode: "offline",
            web_used: false
        });
    }

    try {
        const result = await requestGroqReply(userMessage, safeHistory);
        if (!result.reply) {
            throw new Error("Groq returned an empty response");
        }
        return res.json({
            reply: result.reply,
            mode: "groq",
            web_used: result.webUsed
        });
    } catch (e) {
        console.error("Groq assistant request failed: ", e);
        return res.json({
            reply: offlineAiBotReply(userMessage),
            mode: "offline-fallback",
            web_used: false,
            notice: "Groq was unavailable, so AI Bot answered in offline safety mode."
        });
    }
});

// API Endpoint: GET Blocked URL Domains
app.get('/api/blocked-urls', async (req, res) => {
    try {
        const rows = await dbHelper.all("SELECT domain FROM blocked_domains");
        const list = rows.map(r => r.domain);
        return res.json(list);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// API Endpoint: POST Add Blocked URL Domain
app.post('/api/blocked-urls', requireLogin, verifyCsrf, async (req, res) => {
    let domain = (req.body.domain || "").trim().toLowerCase();
    // Strip protocol and path (e.g., http://www.example.com/xyz -> example.com)
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();

    if (!domain) {
        return res.status(400).json({ error: "Invalid domain domain name." });
    }

    try {
        const existing = await dbHelper.get("SELECT * FROM blocked_domains WHERE domain = ?", [domain]);
        if (!existing) {
            await dbHelper.run("INSERT INTO blocked_domains (domain) VALUES (?)", [domain]);
        }
        const rows = await dbHelper.all("SELECT domain FROM blocked_domains");
        const list = rows.map(r => r.domain);
        return res.json({ success: true, list });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// API Endpoint: POST Delete Blocked URL Domain
app.post('/api/blocked-urls/delete', requireLogin, verifyCsrf, async (req, res) => {
    const domain = (req.body.domain || "").trim().toLowerCase();

    if (!domain) {
        return res.status(400).json({ error: "Invalid domain domain name." });
    }

    try {
        await dbHelper.run("DELETE FROM blocked_domains WHERE domain = ?", [domain]);
        const rows = await dbHelper.all("SELECT domain FROM blocked_domains");
        const list = rows.map(r => r.domain);
        return res.json({ success: true, list });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// API Endpoint: GET Sync Biometric Profiles
app.get('/api/sync-profiles', async (req, res) => {
    try {
        let rows;
        if (req.session.user) {
            rows = await dbHelper.all("SELECT * FROM profiles WHERE username = ? OR username IS NULL", [req.session.user.username]);
        } else {
            rows = await dbHelper.all("SELECT * FROM profiles");
        }
        const profiles = rows.map(r => {
            try {
                r.embedding = JSON.parse(r.embedding);
            } catch (e) {
                r.embedding = [];
            }
            return r;
        });
        return res.json(profiles);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// API Endpoint: POST Sync Biometric Profiles
app.post('/api/sync-profiles', requireLogin, verifyCsrf, async (req, res) => {
    let { profiles } = req.body;
    if (typeof profiles === 'string') {
        try {
            profiles = JSON.parse(profiles);
        } catch (e) {
            return res.status(400).json({ error: "Invalid profiles payload format." });
        }
    }
    if (!Array.isArray(profiles)) {
        return res.status(400).json({ error: "Profiles must be an array." });
    }

    try {
        // Clear old profiles for the current user
        await dbHelper.run("DELETE FROM profiles WHERE username = ? OR username IS NULL", [req.session.user.username]);

        // Insert new profiles associated with this user
        for (const prof of profiles) {
            if (!prof.id || !prof.role || !prof.childName || !prof.parentName || !prof.embedding) {
                continue;
            }
            const embeddingStr = typeof prof.embedding === 'string' ? prof.embedding : JSON.stringify(prof.embedding);
            await dbHelper.run(
                "INSERT INTO profiles (id, username, role, childName, parentName, childAge, relationship, screenLimit, emergencyContact, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [prof.id, req.session.user.username, prof.role, prof.childName, prof.parentName, prof.childAge || '', prof.relationship || '', prof.screenLimit || '', prof.emergencyContact || '', embeddingStr]
            );
        }

        return res.json({ success: true });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin Control Dashboard Route
app.get('/admin-dashboard', requireAdmin, async (req, res) => {
    try {
        const users = await dbHelper.all("SELECT id, username, fullname FROM users");
        const profiles = await dbHelper.all("SELECT id FROM profiles");
        const blocked = await dbHelper.all("SELECT id FROM blocked_domains");
        
        return res.render('admin_dashboard.html', {
            currentUrlName: 'admin-dashboard',
            user: req.session.user,
            users,
            profilesCount: profiles.length,
            blockedDomainsCount: blocked.length
        });
    } catch (e) {
        console.error("Failed to load admin dashboard:", e);
        return res.status(500).send("Internal Server Error loading admin dashboard.");
    }
});

// Admin API: Add User
app.post('/admin/add-user', requireAdmin, verifyCsrf, async (req, res) => {
    const { username, password, fullname } = req.body;
    if (!username || !password || !fullname) {
        return res.status(400).json({ error: "Missing required registration fields." });
    }
    if (username.length < 5) {
        return res.status(400).json({ error: "Username must be at least 5 characters long." });
    }
    try {
        const existing = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
        if (existing) {
            return res.status(400).json({ error: "Username is already taken." });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await dbHelper.run(
            "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
            [username, hashedPassword, fullname]
        );
        const users = await dbHelper.all("SELECT id, username, fullname FROM users");
        return res.json({ success: true, users });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin API: Delete User
app.post('/admin/delete-user', requireAdmin, verifyCsrf, async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: "Missing user ID." });
    }
    try {
        const targetUser = await dbHelper.get("SELECT * FROM users WHERE id = ?", [userId]);
        if (!targetUser) {
            return res.status(404).json({ error: "User account not found." });
        }
        if (targetUser.username === 'admin') {
            return res.status(400).json({ error: "Cannot delete the main admin account." });
        }
        await dbHelper.run("DELETE FROM users WHERE id = ?", [userId]);
        await dbHelper.run("DELETE FROM profiles WHERE username = ?", [targetUser.username]);
        
        const users = await dbHelper.all("SELECT id, username, fullname FROM users");
        return res.json({ success: true, users });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin API: Bulk Ingest Users
app.post('/admin/bulk-upload', requireAdmin, verifyCsrf, async (req, res) => {
    let { users } = req.body;
    if (typeof users === 'string') {
        try {
            users = JSON.parse(users);
        } catch (e) {
            return res.status(400).json({ error: "Invalid JSON bulk format." });
        }
    }
    if (!Array.isArray(users)) {
        return res.status(400).json({ error: "Ingestion payload must be a JSON array." });
    }
    try {
        let createdCount = 0;
        let skippedCount = 0;
        for (const u of users) {
            const { username, password, fullname } = u;
            if (!username || !password || !fullname || username.length < 5) {
                skippedCount++;
                continue;
            }
            const existing = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
            if (existing) {
                skippedCount++;
                continue;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            await dbHelper.run(
                "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
                [username, hashedPassword, fullname]
            );
            createdCount++;
        }
        const allUsers = await dbHelper.all("SELECT id, username, fullname FROM users");
        return res.json({ success: true, createdCount, skippedCount, users: allUsers });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
});

// Admin API: Export Users Dataset
app.get('/admin/export-users', requireAdmin, async (req, res) => {
    try {
        const users = await dbHelper.all("SELECT id, username, fullname FROM users");
        res.setHeader('Content-disposition', 'attachment; filename=users_export.json');
        res.setHeader('Content-type', 'application/json');
        res.write(JSON.stringify(users, null, 2));
        res.end();
    } catch (e) {
        return res.status(500).send("Export users failed: " + e.message);
    }
});

// Admin API: Export Biometric Profiles Dataset
app.get('/admin/export-profiles', requireAdmin, async (req, res) => {
    try {
        const profiles = await dbHelper.all("SELECT * FROM profiles");
        const processed = profiles.map(p => {
            try {
                p.embedding = JSON.parse(p.embedding);
            } catch (e) {}
            return p;
        });
        res.setHeader('Content-disposition', 'attachment; filename=profiles_export.json');
        res.setHeader('Content-type', 'application/json');
        res.write(JSON.stringify(processed, null, 2));
        res.end();
    } catch (e) {
        return res.status(500).send("Export profiles failed: " + e.message);
    }
});

// Start Database and then Express Server
dbHelper.initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`ChildGuard AI backend listening at http://127.0.0.1:${PORT}`);
    });
}).catch(err => {
    console.error("Database initialization failed:", err);
});
