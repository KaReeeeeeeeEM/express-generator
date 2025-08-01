#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes for better CLI experience
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    log(`✅ Created directory: ${dirPath}`, 'green');
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  log(`✅ Created file: ${filePath}`, 'green');
}

function executeCommand(command, cwd) {
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    return true;
  } catch (error) {
    log(`❌ Error executing: ${command}`, 'red');
    log(error.message, 'red');
    return false;
  }
}

// Template files
const templates = {
  packageJson: (projectName, useTypeScript, includeDevDeps) => {
    const base = {
      name: projectName,
      version: "1.0.0",
      description: "",
      main: useTypeScript ? "dist/index.js" : "index.js",
      scripts: {
        test: "echo \"Error: no test specified\" && exit 1",
        start: useTypeScript ? "node dist/index.js" : "node index.js"
      },
      keywords: [],
      author: "",
      license: "ISC",
      dependencies: {
        express: "^5.1.0",
        cors: "^2.8.5",
        dotenv: "^17.2.1",
        jsonwebtoken: "^9.0.0",
        bcryptjs: "^2.4.3"
      }
    };

    if (useTypeScript) {
      base.scripts.dev = "nodemon";
      base.scripts.build = "tsc";
      base.devDependencies = {
        "@types/express": "^5.0.3",
        "@types/cors": "^2.8.19",
        "@types/node": "^24.1.0",
        "@types/jsonwebtoken": "^9.0.0",
        "@types/bcryptjs": "^2.4.0",
        nodemon: "^3.1.10",
        "ts-node": "^10.9.2",
        typescript: "^5.9.2"
      };
    } else {
      base.scripts.dev = "nodemon index.js";
      if (includeDevDeps) {
        base.devDependencies = {
          nodemon: "^3.1.10"
        };
      }
    }

    return JSON.stringify(base, null, 2);
  },

  tsConfig: () => `{
  "compilerOptions": {
    "outDir": "./dist",
    "target": "ES2020",
    "module": "commonjs",
    "esModuleInterop": true,
    "lib": ["esnext"],
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "strict": true,
    "jsx": "react-jsx",
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  "exclude": ["node_modules", "dist"],
  "include": ["src/**/*.ts", "index.ts"]
}`,

  nodemonJson: (useTypeScript) => {
    if (useTypeScript) {
      return `{
  "watch": ["src", "index.ts"],
  "ext": "ts",
  "ignore": ["dist"],
  "exec": "ts-node index.ts"
}`;
    } else {
      return `{
  "watch": ["src", "index.js"],
  "ext": "js",
  "ignore": ["node_modules"],
  "exec": "node index.js"
}`;
    }
  },

  indexJs: () => `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hello, world!',
    timestamp: new Date().toISOString(),
  });
});

// Import routes
// const routes = require('./src/routes');
// app.use('/api', routes);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,

  indexTs: () => `import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

// Routes
app.get('/', (_: Request, res: Response) => {
  res.json({
    message: 'Hello, world!',
    timestamp: new Date().toISOString(),
  });
});

// Import routes
// import routes from './src/routes';
// app.use('/api', routes);

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`,

  routesIndexJs: () => `const express = require('express');
const router = express.Router();

// Example route
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;`,

  routesIndexTs: () => `import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

// Example route
router.get('/health', (_: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;`,

  controllerJs: () => `// Example controller
const getUsers = async (req, res) => {
  try {
    // Your logic here
    res.json({ message: 'Users fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers
};`,

  controllerTs: () => `import type { Request, Response } from 'express';

// Example controller
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Your logic here
    res.json({ message: 'Users fetched successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};`,

  modelJs: () => `// Example model/schema
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.id = Date.now().toString();
    this.createdAt = new Date();
  }

  static findAll() {
    // Your database logic here
    return [];
  }

  save() {
    // Your save logic here
    return this;
  }
}

module.exports = User;`,

  modelTs: () => `// Example model/interface
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export class UserModel {
  constructor(
    public name: string,
    public email: string,
    public id: string = Date.now().toString(),
    public createdAt: Date = new Date()
  ) {}

  static findAll(): User[] {
    // Your database logic here
    return [];
  }

  save(): User {
    // Your save logic here
    return this;
  }
}`,

  // New scalable structure templates
  appTs: () => `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Express API', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;`,

  appJs: () => `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middlewares/errorHandler');
const { logger } = require('./utils/logger');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Express API', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app;`,

  newIndexTs: () => `import app from './src/app';
import { logger } from './src/utils/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});`,

  newIndexJs: () => `const app = require('./src/app');
const { logger } = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});`,

  authMiddlewareTs: () => `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};`,

  authMiddlewareJs: () => `const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { authenticate };`,

  errorHandlerTs: () => `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(500).json({ message: 'Internal server error' });
};`,

  errorHandlerJs: () => `const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = { errorHandler };`,

  loggerTs: () => `export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(\`[INFO] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(\`[ERROR] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(\`[WARN] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[DEBUG] \${new Date().toISOString()}: \${message}\`, ...args);
    }
  }
};`,

  loggerJs: () => `const logger = {
  info: (message, ...args) => {
    console.log(\`[INFO] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  error: (message, ...args) => {
    console.error(\`[ERROR] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(\`[WARN] \${new Date().toISOString()}: \${message}\`, ...args);
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[DEBUG] \${new Date().toISOString()}: \${message}\`, ...args);
    }
  }
};

module.exports = { logger };`,

  authRoutesTs: () => `import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Mock user data (replace with database)
const users: any[] = [];

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
router.get('/profile', authenticate, (req: any, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

export default router;`,

  authRoutesJs: () => `const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Mock user data (replace with database)
const users = [];

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route example
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'Protected route accessed', user: req.user });
});

module.exports = router;`,

  configDbTs: () => `// Database configuration
export const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'myapp_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
};

export const getDbConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return dbConfig[env as keyof typeof dbConfig];
};`,

  configDbJs: () => `// Database configuration
const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'myapp_dev',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
};

const getDbConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return dbConfig[env];
};

module.exports = { dbConfig, getDbConfig };`,

  envFile: () => `# Environment variables
PORT=3000
NODE_ENV=development

# JWT Secret (change this in production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_dev
DB_USER=postgres
DB_PASSWORD=password

# API Keys
# API_KEY=your_api_key_here`,

  gitignore: () => `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDEs and editors
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db`,

  readme: (projectName, useTypeScript, packageManager) => `# ${projectName}

A scalable Node.js Express backend ${useTypeScript ? 'with TypeScript' : 'project'} featuring JWT authentication, structured middleware, and professional organization.

## Features

- ✨ **Modern Architecture** - Clean, scalable folder structure
- 🔐 **JWT Authentication** - Ready-to-use auth system with registration, login, and protected routes
- 🛡️ **Security First** - Password hashing with bcrypt, secure JWT implementation
- 📝 **TypeScript Support** - Full type safety and modern JavaScript features
- 🔧 **Professional Middleware** - Error handling, logging, and authentication middleware
- 🏗️ **Organized Structure** - Separate concerns with config, controllers, middleware, routes, and utilities
- 🔄 **Hot Reload** - Development server with automatic restart

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- ${packageManager}

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd ${projectName}
\`\`\`

2. Install dependencies
\`\`\`bash
${packageManager} install
\`\`\`

3. Configure environment variables
\`\`\`bash
# Update the JWT_SECRET and other variables in .env file
cp .env .env.local
\`\`\`

4. **Important**: Change the JWT_SECRET in your \`.env\` file before running in production!

### Development

Start the development server:
\`\`\`bash
${packageManager} run dev
\`\`\`

${useTypeScript ? `### Build

Build for production:
\`\`\`bash
${packageManager} run build
\`\`\`

### Production

Start the production server:
\`\`\`bash
${packageManager} start
\`\`\`
` : ''}

## Project Structure

\`\`\`
${projectName}/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.${useTypeScript ? 'ts' : 'js'}   # Database configuration
│   ├── controllers/     # Route handler logic
│   │   └── userController.${useTypeScript ? 'ts' : 'js'} # Example controller
│   ├── middlewares/     # Custom middleware
│   │   ├── auth.${useTypeScript ? 'ts' : 'js'}       # JWT authentication middleware
│   │   └── errorHandler.${useTypeScript ? 'ts' : 'js'} # Global error handler
│   ├── routes/          # API route definitions
│   │   ├── index.${useTypeScript ? 'ts' : 'js'}      # Health check routes
│   │   └── auth.${useTypeScript ? 'ts' : 'js'}       # Authentication routes
│   ├── utils/           # Helper functions
│   │   └── logger.${useTypeScript ? 'ts' : 'js'}     # Logging utility
│   └── app.${useTypeScript ? 'ts' : 'js'}           # Express app setup
├── ${useTypeScript ? 'dist/' : ''}              # ${useTypeScript ? 'Compiled JavaScript (auto-generated)' : ''}
├── .env                 # Environment variables
├── .gitignore          # Git ignore rules
├── ${useTypeScript ? 'index.ts' : 'index.js'}             # Application entry point
├── package.json        # Project dependencies and scripts
${useTypeScript ? '├── tsconfig.json       # TypeScript configuration\n├── nodemon.json        # Nodemon configuration' : '└── nodemon.json        # Nodemon configuration (if installed)'}
└── README.md           # This file
\`\`\`

## API Endpoints

### Public Routes
- \`GET /\` - Welcome message
- \`GET /api/health\` - Health check endpoint
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login

### Protected Routes
- \`GET /api/auth/profile\` - Get user profile (requires JWT token)

### Authentication Usage

1. **Register a new user:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "yourpassword"}'
\`\`\`

2. **Login:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "yourpassword"}'
\`\`\`

3. **Access protected routes:**
\`\`\`bash
curl -X GET http://localhost:3000/api/auth/profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## Environment Variables

- \`PORT\` - Server port (default: 3000)
- \`NODE_ENV\` - Environment (development/production)
- \`JWT_SECRET\` - Secret key for JWT token signing (⚠️ **Change this in production!**)
- \`DB_HOST\` - Database host
- \`DB_PORT\` - Database port
- \`DB_NAME\` - Database name
- \`DB_USER\` - Database username
- \`DB_PASSWORD\` - Database password

## Security Features

- 🔐 **Password Hashing** - Uses bcryptjs for secure password storage
- 🎫 **JWT Tokens** - Stateless authentication with configurable expiration
- 🛡️ **Protected Routes** - Middleware-based route protection
- 🔒 **Environment Variables** - Sensitive data stored in environment variables

## Development Features

- 📝 **Structured Logging** - Professional logging with timestamps and levels
- 🔄 **Hot Reload** - Automatic server restart during development
- 🎯 **Error Handling** - Centralized error handling middleware
- 🏗️ **Modular Architecture** - Separation of concerns for maintainability

## Extending the API

1. **Add new routes**: Create files in \`src/routes/\`
2. **Add controllers**: Create files in \`src/controllers/\`
3. **Add middleware**: Create files in \`src/middlewares/\`
4. **Add utilities**: Create files in \`src/utils/\`
5. **Database models**: Add to \`src/models/\` (if using examples)

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.`
};

async function main() {
  log('🚀 Express Project Generator', 'cyan');
  log('================================', 'cyan');
  console.log();

  try {
    // Get project details
    const projectName = await question(colorize('📝 Project name: ', 'yellow'));
    if (!projectName.trim()) {
      log('❌ Project name is required!', 'red');
      process.exit(1);
    }

    const useTypeScriptAnswer = await question(colorize('📘 Use TypeScript? (Y/n): ', 'yellow'));
    const useTypeScript = useTypeScriptAnswer.toLowerCase() !== 'n';

    const packageManagerAnswer = await question(colorize('📦 Package manager (npm/yarn/pnpm): ', 'yellow')) || 'npm';
    const packageManager = packageManagerAnswer.toLowerCase();

    if (!['npm', 'yarn', 'pnpm'].includes(packageManager)) {
      log('❌ Invalid package manager! Using npm instead.', 'red');
      packageManager = 'npm';
    }

    const includeReadmeAnswer = await question(colorize('📄 Include README.md? (Y/n): ', 'yellow'));
    const includeReadme = includeReadmeAnswer.toLowerCase() !== 'n';

    const includeExamplesAnswer = await question(colorize('📁 Include example controllers/models? (Y/n): ', 'yellow'));
    const includeExamples = includeExamplesAnswer.toLowerCase() !== 'n';

    const installDepsAnswer = await question(colorize('⬇️  Install dependencies automatically? (Y/n): ', 'yellow'));
    const installDeps = installDepsAnswer.toLowerCase() !== 'n';

    const initGitAnswer = await question(colorize('🔧 Initialize Git repository? (Y/n): ', 'yellow'));
    const initGit = initGitAnswer.toLowerCase() !== 'n';

    console.log();
    log('🔨 Creating project...', 'magenta');

    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);
    createDirectory(projectPath);

    // Create folder structure
    createDirectory(path.join(projectPath, 'src'));
    createDirectory(path.join(projectPath, 'src/config'));
    createDirectory(path.join(projectPath, 'src/controllers'));
    createDirectory(path.join(projectPath, 'src/middlewares'));
    createDirectory(path.join(projectPath, 'src/routes'));
    createDirectory(path.join(projectPath, 'src/utils'));

    // Create package.json
    writeFile(
      path.join(projectPath, 'package.json'),
      templates.packageJson(projectName, useTypeScript, !useTypeScript)
    );

    // Create main index file (entry point)
    writeFile(
      path.join(projectPath, useTypeScript ? 'index.ts' : 'index.js'),
      useTypeScript ? templates.newIndexTs() : templates.newIndexJs()
    );

    // Create app.ts/app.js (Express app configuration)
    writeFile(
      path.join(projectPath, 'src/app.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.appTs() : templates.appJs()
    );

    // Create TypeScript config if needed
    if (useTypeScript) {
      writeFile(path.join(projectPath, 'tsconfig.json'), templates.tsConfig());
    }

    // Create nodemon config
    writeFile(path.join(projectPath, 'nodemon.json'), templates.nodemonJson(useTypeScript));

    // Create config files
    writeFile(
      path.join(projectPath, 'src/config/database.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.configDbTs() : templates.configDbJs()
    );

    // Create middleware files
    writeFile(
      path.join(projectPath, 'src/middlewares/auth.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.authMiddlewareTs() : templates.authMiddlewareJs()
    );

    writeFile(
      path.join(projectPath, 'src/middlewares/errorHandler.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.errorHandlerTs() : templates.errorHandlerJs()
    );

    // Create utility files
    writeFile(
      path.join(projectPath, 'src/utils/logger.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.loggerTs() : templates.loggerJs()
    );

    // Create routes
    writeFile(
      path.join(projectPath, 'src/routes/index.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.routesIndexTs() : templates.routesIndexJs()
    );

    // Create auth routes with JWT authentication
    writeFile(
      path.join(projectPath, 'src/routes/auth.' + (useTypeScript ? 'ts' : 'js')),
      useTypeScript ? templates.authRoutesTs() : templates.authRoutesJs()
    );

    // Create example files if requested
    if (includeExamples) {
      // Create models directory for examples
      createDirectory(path.join(projectPath, 'src/models'));
      
      writeFile(
        path.join(projectPath, 'src/controllers/userController.' + (useTypeScript ? 'ts' : 'js')),
        useTypeScript ? templates.controllerTs() : templates.controllerJs()
      );

      writeFile(
        path.join(projectPath, 'src/models/User.' + (useTypeScript ? 'ts' : 'js')),
        useTypeScript ? templates.modelTs() : templates.modelJs()
      );
    }

    // Create environment file
    writeFile(path.join(projectPath, '.env'), templates.envFile());

    // Create .gitignore
    writeFile(path.join(projectPath, '.gitignore'), templates.gitignore());

    // Create README if requested
    if (includeReadme) {
      writeFile(
        path.join(projectPath, 'README.md'),
        templates.readme(projectName, useTypeScript, packageManager)
      );
    }

    // Initialize Git if requested
    if (initGit) {
      log('🔧 Initializing Git repository...', 'blue');
      executeCommand('git init', projectPath);
      executeCommand('git add .', projectPath);
      executeCommand('git commit -m "Initial commit"', projectPath);
    }

    // Install dependencies if requested
    if (installDeps) {
      log('📦 Installing dependencies...', 'blue');
      const installCommand = packageManager === 'npm' ? 'npm install' : 
                           packageManager === 'yarn' ? 'yarn install' : 
                           'pnpm install';
      
      if (executeCommand(installCommand, projectPath)) {
        log('✅ Dependencies installed successfully!', 'green');
      }
    }

    console.log();
    log('🎉 Project created successfully!', 'green');
    log('========================', 'green');
    console.log();
    log('Next steps:', 'bright');
    log(`1. cd ${projectName}`, 'cyan');
    if (!installDeps) {
      log(`2. ${packageManager} install`, 'cyan');
      log(`3. ${packageManager} run dev`, 'cyan');
    } else {
      log(`2. ${packageManager} run dev`, 'cyan');
    }
    console.log();
    log('Happy coding! 🚀', 'magenta');

  } catch (error) {
    log('❌ An error occurred:', 'red');
    log(error.message, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log();
  log('👋 Setup cancelled by user', 'yellow');
  process.exit(0);
});

if (require.main === module) {
  main();
}
