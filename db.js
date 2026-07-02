const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'db.sqlite3');

// Ensure parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Helper to run query and return Promise
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Helper to get single row
function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Helper to get all rows
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Initialize tables
async function initDb() {
    await run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            fullname TEXT NOT NULL
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS blocked_domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT UNIQUE NOT NULL
        )
    `);

    await run(`
        CREATE TABLE IF NOT EXISTS profiles (
            id TEXT PRIMARY KEY,
            username TEXT,
            role TEXT NOT NULL,
            childName TEXT NOT NULL,
            parentName TEXT NOT NULL,
            childAge TEXT,
            relationship TEXT,
            screenLimit TEXT,
            emergencyContact TEXT,
            embedding TEXT NOT NULL
        )
    `);

    // Check if username column exists in profiles table
    try {
        const columns = await all("PRAGMA table_info(profiles)");
        const hasUsername = columns.some(col => col.name === 'username');
        if (!hasUsername) {
            await run("ALTER TABLE profiles ADD COLUMN username TEXT");
            console.log("Database Migration: Added 'username' column to profiles table.");
        }
    } catch (err) {
        console.error("Database Migration Error for profiles table:", err);
    }

    // Create default superuser admin/admin123 if it does not exist
    const adminUser = await get("SELECT * FROM users WHERE username = ?", ["admin"]);
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await run(
            "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
            ["admin", hashedPassword, "Admin User"]
        );
        console.log("Default admin superuser created (username: admin, password: admin123)");
    }
}

module.exports = {
    db,
    run,
    get,
    all,
    initDb
};
