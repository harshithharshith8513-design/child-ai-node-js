const bcrypt = require('bcryptjs');
const dbHelper = require('./db');

const args = process.argv.slice(2);
if (args.length < 3) {
    console.log("Usage: node create_user.js <username> <password> <fullname>");
    process.exit(1);
}

const [username, password, fullname] = args;

async function run() {
    try {
        await dbHelper.initDb();
        const existing = await dbHelper.get("SELECT * FROM users WHERE username = ?", [username]);
        if (existing) {
            console.error(`Error: User with username '${username}' already exists.`);
            process.exit(1);
        }
        const hashed = await bcrypt.hash(password, 10);
        await dbHelper.run(
            "INSERT INTO users (username, password, fullname) VALUES (?, ?, ?)",
            [username, hashed, fullname]
        );
        console.log(`Success: Created user '${username}' (${fullname}) successfully.`);
        process.exit(0);
    } catch (e) {
        console.error("Error creating user:", e.message);
        process.exit(1);
    }
}

run();
