const fs = require('fs');
const path = require('path');

function listDirectoryContents(dir, indent = '') {
  console.log(`${indent}Directory: ${dir}`);
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        console.log(`${indent}  📁 ${file}`);
        // Don't go too deep - avoid node_modules
        if (file !== 'node_modules') {
          listDirectoryContents(filePath, indent + '    ');
        }
      } else {
        console.log(`${indent}  📄 ${file}`);
      }
    });
  } catch (err) {
    console.error(`${indent}Error reading directory ${dir}: ${err.message}`);
  }
}

// Check if a file exists
function checkFile(filePath) {
  try {
    const stats = fs.statSync(filePath);
    console.log(`✅ File exists: ${filePath} (${stats.size} bytes)`);
    return true;
  } catch (err) {
    console.error(`❌ File does not exist: ${filePath}`);
    return false;
  }
}

// Main
console.log('Current working directory:', process.cwd());
listDirectoryContents(process.cwd());

// Check specific important files
const filesToCheck = [
  'index.js',
  'package.json',
  path.join('backend', 'build', 'index.html')
];

filesToCheck.forEach(checkFile);

module.exports = { listDirectoryContents, checkFile }; 