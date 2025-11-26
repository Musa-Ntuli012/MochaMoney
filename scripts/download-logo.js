// Script to download logo from Google Drive
// Run: node scripts/download-logo.js

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_DRIVE_FILE_ID = '19GAT6JY-Uc0Thf4nIPiP79bnRGxScEp5';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'Logo.png');

// Try direct download URL
const downloadUrl = `https://drive.google.com/uc?export=download&id=${GOOGLE_DRIVE_FILE_ID}`;

console.log('Downloading logo from Google Drive...');
console.log('Note: If this fails, you may need to:');
console.log('1. Make the Google Drive file publicly accessible');
console.log('2. Or manually download it and place it in public/Logo.png');

const file = fs.createWriteStream(OUTPUT_PATH);

https.get(downloadUrl, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✅ Logo downloaded successfully to public/Logo.png');
    });
  } else {
    console.error('❌ Failed to download. Status:', response.statusCode);
    console.error('Please manually download the image and place it in public/Logo.png');
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('❌ Error downloading:', err.message);
  console.error('Please manually download the image and place it in public/Logo.png');
  process.exit(1);
});

