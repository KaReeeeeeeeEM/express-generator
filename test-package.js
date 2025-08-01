#!/usr/bin/env node

/**
 * Test script to verify the package works correctly
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message, color = '\x1b[0m') {
  console.log(`${color}${message}\x1b[0m`);
}

function testPackageStructure() {
  log('🔍 Testing package structure...', '\x1b[34m');
  
  const requiredFiles = [
    'package.json',
    'README.md',
    'LICENSE',
    'bin/create-express-project.js',
    'bin/express-quick-setup.js'
  ];

  let allGood = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`  ✅ ${file} exists`);
    } else {
      log(`  ❌ ${file} missing`, '\x1b[31m');
      allGood = false;
    }
  });

  return allGood;
}

function testPackageJson() {
  log('\n📦 Testing package.json...', '\x1b[34m');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredFields = ['name', 'version', 'description', 'bin', 'keywords', 'author', 'license'];
    let allGood = true;

    requiredFields.forEach(field => {
      if (pkg[field]) {
        log(`  ✅ ${field}: ${typeof pkg[field] === 'object' ? 'defined' : pkg[field]}`);
      } else {
        log(`  ❌ ${field} missing`, '\x1b[31m');
        allGood = false;
      }
    });

    return allGood;
  } catch (error) {
    log(`  ❌ Invalid package.json: ${error.message}`, '\x1b[31m');
    return false;
  }
}

function testScriptExecutability() {
  log('\n🔧 Testing script executability...', '\x1b[34m');
  
  try {
    const scripts = ['bin/create-express-project.js', 'bin/express-quick-setup.js'];
    let allGood = true;

    scripts.forEach(script => {
      const stats = fs.statSync(script);
      const isExecutable = !!(stats.mode & parseInt('111', 8));
      
      if (isExecutable) {
        log(`  ✅ ${script} is executable`);
      } else {
        log(`  ⚠️  ${script} is not executable (will be fixed by npm)`, '\x1b[33m');
      }
    });

    return allGood;
  } catch (error) {
    log(`  ❌ Error checking executability: ${error.message}`, '\x1b[31m');
    return false;
  }
}

function runTests() {
  log('🚀 Testing npm package readiness...', '\x1b[35m');
  log('================================\n', '\x1b[35m');

  const tests = [
    testPackageStructure,
    testPackageJson,
    testScriptExecutability
  ];

  const results = tests.map(test => test());
  const allPassed = results.every(result => result);

  log('\n📊 Test Results:', '\x1b[35m');
  log('================', '\x1b[35m');

  if (allPassed) {
    log('🎉 All tests passed! Package is ready for publishing.', '\x1b[32m');
    log('\nNext steps:', '\x1b[36m');
    log('1. npm login', '\x1b[36m');
    log('2. npm publish', '\x1b[36m');
    log('3. Test: npm install -g your-package-name', '\x1b[36m');
  } else {
    log('❌ Some tests failed. Please fix the issues above.', '\x1b[31m');
  }

  return allPassed;
}

// Run tests if this script is executed directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };
