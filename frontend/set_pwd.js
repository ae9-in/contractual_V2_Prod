const fs = require('fs');
const bcrypt = require('bcryptjs');

const password = 'AdminContractual2026!';
const hash = bcrypt.hashSync(password, 10);

const envPath = '../.env';
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/ADMIN_PASSWORD_HASH=".*"/g, 'ADMIN_PASSWORD_HASH="' + hash + '"');
fs.writeFileSync(envPath, envContent, 'utf8');

console.log("SUCCESS");
