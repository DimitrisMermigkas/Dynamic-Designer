const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jsDir = './build/static/js';

console.log('Starting obfuscation process...');

// Check if build directory exists
if (!fs.existsSync(jsDir)) {
  console.log('Build directory not found - skipping obfuscation');
  process.exit(0);
}

try {
  // Get all JS files in the directory
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  
  if (files.length === 0) {
    console.log('No JS files found to obfuscate');
    process.exit(0);
  }
  
  console.log(`Found ${files.length} JS files to obfuscate`);
  
  let successCount = 0;
  let failCount = 0;
  
  // Obfuscate each file individually
  files.forEach((file, index) => {
    const filePath = path.join(jsDir, file);
    console.log(`Obfuscating ${file} (${index + 1}/${files.length})`);
    
    try {
      execSync(`javascript-obfuscator "${filePath}" --output "${filePath}" --config obfuscator.config.js`, {
        stdio: 'inherit',
        timeout: 30000 // 30 second timeout
      });
      console.log(`✅ Successfully obfuscated ${file}`);
      successCount++;
    } catch (error) {
      console.log(`⚠️  Obfuscation failed for ${file} - continuing...`);
      console.log(`Error: ${error.message}`);
      failCount++;
    }
  });
  
  // Remove source maps
  console.log('Removing source maps...');
  try {
    execSync('rimraf ./build/static/js/*.map', { stdio: 'inherit' });
    console.log('✅ Source maps removed');
  } catch (error) {
    console.log('⚠️  Source map removal failed - continuing...');
    console.log(`Error: ${error.message}`);
  }
  
  console.log(`🎉 Obfuscation process completed: ${successCount} successful, ${failCount} failed`);
  
  // Don't fail the build if some files couldn't be obfuscated
  if (failCount > 0) {
    console.log('⚠️  Some files could not be obfuscated, but build will continue');
  }
  
} catch (error) {
  console.log('❌ Obfuscation process failed');
  console.log(`Error: ${error.message}`);
  console.log('⚠️  Build will continue without obfuscation');
  // Don't exit with error code to prevent build failure
  process.exit(0);
} 