const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting designer obfuscation process...');

let totalSuccess = 0;
let totalFail = 0;

// Function to obfuscate files in a directory
function obfuscateDirectory(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.log(`${description} directory not found - skipping`);
    return;
  }

  try {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js'));
    
    if (files.length === 0) {
      console.log(`No JS files found in ${description}`);
      return;
    }
    
    console.log(`Found ${files.length} JS files in ${description}`);
    
    let successCount = 0;
    let failCount = 0;
    
    files.forEach((file, index) => {
      const filePath = path.join(dirPath, file);
      console.log(`Obfuscating ${file} (${index + 1}/${files.length})`);
      
      try {
        execSync(`javascript-obfuscator "${filePath}" --output "${filePath}" --config obfuscator.config.js`, {
          stdio: 'inherit',
          timeout: 30000 // 30 second timeout
        });
        console.log(`✅ Successfully obfuscated ${file}`);
        successCount++;
        totalSuccess++;
      } catch (error) {
        console.log(`⚠️  Obfuscation failed for ${file} - continuing...`);
        console.log(`Error: ${error.message}`);
        failCount++;
        totalFail++;
      }
    });
    
    // Remove source maps
    console.log(`Removing source maps from ${description}...`);
    try {
      execSync(`rimraf "${dirPath}/*.map"`, { stdio: 'inherit' });
      console.log(`✅ Source maps removed from ${description}`);
    } catch (error) {
      console.log(`⚠️  Source map removal failed for ${description} - continuing...`);
      console.log(`Error: ${error.message}`);
    }
    
    console.log(`${description}: ${successCount} successful, ${failCount} failed`);
    
  } catch (error) {
    console.log(`❌ Error processing ${description}`);
    console.log(`Error: ${error.message}`);
    totalFail++;
  }
}

try {
  // Obfuscate build directory (React app)
  obfuscateDirectory('./build/static/js', 'build/static/js');
  
  // Obfuscate dist directory (package files)
  obfuscateDirectory('./dist/cjs', 'dist/cjs');
  obfuscateDirectory('./dist/esm', 'dist/esm');
  
  console.log(`🎉 Designer obfuscation process completed: ${totalSuccess} total successful, ${totalFail} total failed`);
  
  // Don't fail the build if some files couldn't be obfuscated
  if (totalFail > 0) {
    console.log('⚠️  Some files could not be obfuscated, but build will continue');
  }
  
} catch (error) {
  console.log('❌ Designer obfuscation process failed');
  console.log(`Error: ${error.message}`);
  console.log('⚠️  Build will continue without obfuscation');
  // Don't exit with error code to prevent build failure
  process.exit(0);
} 