const fs = require('fs');
const path = require('path');

// Read the service account JSON
const jsonPath = 'C:\Users\mynks\Downloads\ai-interview-project-mynk-firebase-adminsdk-fbsvc-fa3253a4d3.json';
const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Read current .env.local
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');

// Replace FIREBASE_PRIVATE_KEY
const newKey = serviceAccount.private_key;
const escaped = newKey.replace(/\n/g, '\\n');

envContent = envContent.replace(
    /FIREBASE_PRIVATE_KEY=.*/,
    `FIREBASE_PRIVATE_KEY="${escaped}"`
);

// Also update client email just in case
envContent = envContent.replace(
    /FIREBASE_CLIENT_EMAIL=.*/,
    `FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`
);

fs.writeFileSync(envPath, envContent);
console.log('✅ .env.local updated with new key');
console.log('Client email:', serviceAccount.client_email);
console.log('Key ID:', serviceAccount.private_key_id);
