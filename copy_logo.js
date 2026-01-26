const fs = require('fs');
const path = require('path');

const src = 'C:\\Users\\777\\.gemini\\antigravity\\brain\\a581c196-e6df-4533-b0c4-ed6a38a6e5eb\\uploaded_media_1769449368653.png';
const dest = path.join(__dirname, 'public', 'logo.png');

try {
    fs.copyFileSync(src, dest);
    console.log('Logo copied successfully to ' + dest);
} catch (err) {
    console.error('Error copying logo:', err);
    process.exit(1);
}
