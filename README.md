# Express Project Scaffolder

🚀 **The fastest way to scaffold professional Express.js projects with TypeScript/JavaScript support, JWT authentication, and scalable architecture**

An interactive CLI tool that creates production-ready Express.js backend projects with a well-organized folder structure, JWT authentication system, professional middleware, and best practices built-in.

## ✨ Features

- 🎯 **Interactive Setup** - Guided prompts for all project preferences
- 📘 **TypeScript & JavaScript** - Full support for both languages
- 🔐 **JWT Authentication** - Complete auth system with registration, login, and protected routes
- 🛡️ **Security First** - Password hashing with bcrypt, secure JWT implementation
- 📦 **Multiple Package Managers** - npm, yarn, and pnpm support
- 🏗️ **Scalable Architecture** - Professional folder structure with config, middleware, utils
- ⚡ **Development Ready** - Pre-configured Nodemon, TypeScript, and more
- 📝 **Professional Middleware** - Error handling, logging, and authentication middleware
- 🔧 **Environment Setup** - .env configuration with JWT secrets and database config
- 🔄 **Git Integration** - Optional repository initialization
- 🚀 **Auto Installation** - Dependencies installed automatically

## 🚀 Quick Start

### One-time Usage (without installation, Recommended ✅)
```bash
npx express-project-scaffolder
```

## 📁 Generated Project Structure

```
your-awesome-api/
├── src/
│   ├── config/               # Configuration files
│   │   └── database.ts       # Database configuration
│   ├── controllers/          # Route handler logic
│   │   └── userController.ts # Example controller (optional)
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.ts           # JWT authentication middleware
│   │   └── errorHandler.ts   # Global error handler
│   ├── routes/               # API route definitions
│   │   ├── index.ts          # Health check routes
│   │   └── auth.ts           # Authentication routes
│   ├── utils/                # Helper functions
│   │   └── logger.ts         # Logging utility
│   ├── models/               # Data models & schemas (optional)
│   │   └── User.ts           # Example model (optional)
│   └── app.ts                # Express app setup
├── dist/                     # Compiled output (TypeScript)
├── .env                      # Environment variables with JWT secret
├── .gitignore               # Sensible Git ignore rules
├── index.ts                 # Main application entry
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── nodemon.json             # Development server config
└── README.md                # Comprehensive project documentation
```

## 🎨 What You Get

### 🔧 Pre-configured Tools
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type safety and modern JavaScript features
- **JWT Authentication** - Complete auth system with jsonwebtoken
- **Bcrypt** - Secure password hashing
- **Nodemon** - Auto-restart during development
- **CORS** - Cross-origin resource sharing
- **Professional Middleware** - Error handling, logging, authentication
- **Environment Variables** - Secure configuration management

### 📋 Ready-to-Use Scripts
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon",
    "build": "tsc"
  }
}
```

### 🎯 Example API Endpoints
- `GET /` - Welcome message with timestamp
- `GET /api/health` - Health check endpoint
- `POST /api/auth/register` - User registration with JWT
- `POST /api/auth/login` - User login with JWT
- `GET /api/auth/profile` - Protected route example (requires JWT)
- Example controller patterns for rapid development

## 🛠️ Interactive Setup Process

The CLI will guide you through:

1. **📝 Project Name** - Choose your project directory name
2. **📘 Language Choice** - TypeScript or JavaScript
3. **📦 Package Manager** - npm, yarn, or pnpm
4. **📄 Documentation** - Include README.md file
5. **📁 Example Code** - Add sample controllers and models
6. **⬇️ Dependencies** - Auto-install packages
7. **🔧 Git Setup** - Initialize Git repository

## 🔥 Usage Examples

### Basic Workflow
```bash
# Create new project
create-express-app

# Follow the prompts...
✓ Project name: my-awesome-api
✓ Use TypeScript? Yes
✓ Package manager: npm
✓ Include README? Yes
✓ Include examples? Yes
✓ Install dependencies? Yes
✓ Initialize Git? Yes

# Navigate and start developing
cd my-awesome-api
npm run dev
```

### Generated TypeScript Project
```typescript
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.get('/', (_: Request, res: Response) => {
  res.json({
    message: 'Hello, world!',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

## 🎯 Perfect For

- 🚀 **Rapid Prototyping** - Get APIs up and running in seconds
- 🏢 **Enterprise Projects** - Professional structure and best practices
- 🎓 **Learning** - Well-documented examples and patterns
- 👥 **Team Development** - Consistent project structure across teams

## 🔧 Advanced Features

### Environment Configuration
```env
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
# API_KEY=your_api_key_here
```

### TypeScript Configuration
- Strict type checking enabled
- ES2020 target for modern features
- Source maps for debugging
- Declaration files for libraries

### Development Experience
- Hot reload with Nodemon
- Instant TypeScript compilation
- Comprehensive error reporting
- Git-ready project structure

## 📦 Dependencies Included

### Core Runtime
- **express** - Web application framework
- **cors** - Enable cross-origin requests
- **dotenv** - Environment variable management
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing and validation

### TypeScript Development
- **typescript** - TypeScript compiler
- **ts-node** - TypeScript execution engine
- **@types/node** - Node.js type definitions
- **@types/express** - Express type definitions
- **@types/jsonwebtoken** - JWT type definitions
- **@types/bcryptjs** - Bcrypt type definitions
- **nodemon** - Development server with auto-restart

## 🚀 Next Steps After Generation

```bash
# Start development
npm run dev

# Test the authentication system
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Add more dependencies as needed
npm install mongoose sequelize prisma

# Build for production
npm run build

# Deploy to production
npm start
```

## 🤝 Contributing

We welcome contributions! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- 📖 [Documentation](https://github.com/yourusername/express-project-scaffolder)
- 🐛 [Report Issues](https://github.com/yourusername/express-project-scaffolder/issues)
- 💬 [Discussions](https://github.com/yourusername/express-project-scaffolder/discussions)

---

**Made with ❤️ for the Node.js community**

*Stop wasting time on boilerplate. Start building features that matter.*
