#!/usr/bin/env node

/**
 * Express Project Generator - Simplified Version
 * A lightweight, interactive CLI tool to quickly scaffold Express.js projects
 * 
 * Usage: node express-quick-setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Simple prompt function
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Quick setup function
async function quickSetup() {
  console.log('🚀 Express Quick Setup');
  console.log('======================\n');

  const projectName = await prompt('Project name: ');
  const useTS = (await prompt('Use TypeScript? (y/N): ')).toLowerCase() === 'y';
  const pm = await prompt('Package manager (npm/yarn/pnpm) [npm]: ') || 'npm';

  const projectPath = path.join(process.cwd(), projectName);
  
  // Create directories
  ['src', 'src/routes', 'src/controllers', 'src/models', 'public'].forEach(dir => {
    fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
  });

  // Package.json
  const pkg = {
    name: projectName,
    version: "1.0.0",
    main: useTS ? "dist/index.js" : "index.js",
    scripts: {
      start: useTS ? "node dist/index.js" : "node index.js",
      dev: useTS ? "nodemon" : "nodemon index.js",
      ...(useTS && { build: "tsc" })
    },
    dependencies: {
      express: "^5.1.0",
      cors: "^2.8.5",
      dotenv: "^17.2.1"
    },
    ...(useTS && {
      devDependencies: {
        "@types/express": "^5.0.3",
        "@types/cors": "^2.8.19",
        "@types/node": "^24.1.0",
        nodemon: "^3.1.10",
        "ts-node": "^10.9.2",
        typescript: "^5.9.2"
      }
    })
  };

  fs.writeFileSync(path.join(projectPath, 'package.json'), JSON.stringify(pkg, null, 2));

  // Index file
  const indexContent = useTS ? 
    `import express from 'express';\nimport cors from 'cors';\n\nconst app = express();\nconst PORT = 3000;\n\napp.use(express.json());\napp.use(cors());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World!' });\n});\n\napp.listen(PORT, () => console.log(\`Server on port \${PORT}\`));` :
    `const express = require('express');\nconst cors = require('cors');\n\nconst app = express();\nconst PORT = 3000;\n\napp.use(express.json());\napp.use(cors());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello World!' });\n});\n\napp.listen(PORT, () => console.log(\`Server on port \${PORT}\`));`;

  fs.writeFileSync(path.join(projectPath, `index.${useTS ? 'ts' : 'js'}`), indexContent);

  // TypeScript config
  if (useTS) {
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        outDir: "./dist",
        esModuleInterop: true,
        strict: true,
        skipLibCheck: true
      },
      include: ["src/**/*", "index.ts"]
    };
    fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsConfig, null, 2));

    const nodemonConfig = {
      watch: ["src", "index.ts"],
      ext: "ts",
      exec: "ts-node index.ts"
    };
    fs.writeFileSync(path.join(projectPath, 'nodemon.json'), JSON.stringify(nodemonConfig, null, 2));
  }

  // .env and .gitignore
  fs.writeFileSync(path.join(projectPath, '.env'), 'PORT=3000\nNODE_ENV=development\n');
  fs.writeFileSync(path.join(projectPath, '.gitignore'), 'node_modules/\n.env\ndist/\n*.log\n');

  console.log(`\n✅ Project "${projectName}" created!`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  ${pm} install`);
  console.log(`  ${pm} run dev`);
}

quickSetup().catch(console.error);
