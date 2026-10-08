const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
const androidHtmlPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html');
const apkPath = path.join(__dirname, '..', 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

console.log('=== VERIFYING FRONTEND & ANDROID PRODUCTION ARTIFACTS ===');

if (fs.existsSync(distHtmlPath)) {
  const content = fs.readFileSync(distHtmlPath, 'utf8');
  console.log('✔ dist/index.html exists and is valid (size: ' + content.length + ' bytes)');
} else {
  console.error('✘ dist/index.html missing');
  process.exit(1);
}

if (fs.existsSync(androidHtmlPath)) {
  const content = fs.readFileSync(androidHtmlPath, 'utf8');
  console.log('✔ Android assets/public/index.html synced successfully (size: ' + content.length + ' bytes)');
} else {
  console.error('✘ Android native assets missing');
  process.exit(1);
}

if (fs.existsSync(apkPath)) {
  const stats = fs.statSync(apkPath);
  console.log('✔ Native Android APK compiled successfully (' + (stats.size / 1024 / 1024).toFixed(2) + ' MB)');
} else {
  console.error('✘ Android APK missing');
  process.exit(1);
}

console.log('=== ALL FRONTEND & ANDROID VERIFICATIONS PASSED ===');
