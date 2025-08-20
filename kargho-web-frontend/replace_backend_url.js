const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!backendUrl) {
    console.error('Error: NEXT_PUBLIC_BACKEND_URL environment variable is not set.');
    process.exit(1);
}

content = content.replace('__BACKEND_URL_PLACEHOLDER__', backendUrl);

fs.writeFileSync(filePath, content, 'utf8');

console.log('Backend URL successfully injected into index.html');