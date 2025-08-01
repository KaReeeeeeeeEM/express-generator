# 📦 How to Publish to NPM

## Step-by-Step Publishing Guide

### Prerequisites
1. **Node.js installed** (v14 or higher)
2. **npm account** - Create one at [npmjs.com](https://www.npmjs.com/signup)
3. **Git repository** (optional but recommended)

### 🚀 Publishing Steps

#### 1. Navigate to the package directory
```bash
cd /Users/johnsonmmbaga/github-repos/zuru-ai-backend/express-generator
```

#### 2. Login to npm
```bash
npm login
```
Enter your npm credentials when prompted.

#### 3. Check if package name is available
```bash
npm search express-project-scaffolder
```
If results show up, the name is taken. Update `package.json` with a unique name like:
- `@yourusername/express-project-scaffolder`
- `express-api-scaffolder`
- `create-express-backend`

#### 4. Update package.json with your details
```json
{
  "name": "your-unique-package-name",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-repo-name.git"
  }
}
```

#### 5. Test the package locally
```bash
# Install globally from local directory
npm install -g .

# Test the commands
create-express-app --help
express-quick --help

# Uninstall after testing
npm uninstall -g express-project-scaffolder
```

#### 6. Publish to npm
```bash
npm publish
```

#### 7. If using scoped package (recommended for first-time publishers)
```bash
# Update package.json name to: "@yourusername/express-project-scaffolder"
npm publish --access public
```

### 🔄 Version Updates

For future updates:
```bash
# Update version (patch: 1.0.0 -> 1.0.1)
npm version patch

# Update version (minor: 1.0.0 -> 1.1.0) 
npm version minor

# Update version (major: 1.0.0 -> 2.0.0)
npm version major

# Publish the update
npm publish
```

### 🎯 Alternative: Use GitHub + NPM Integration

#### 1. Create GitHub repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/express-project-scaffolder.git
git push -u origin main
```

#### 2. Add GitHub Actions for auto-publishing
Create `.github/workflows/publish.yml`:
```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 🛡️ Security & Best Practices

#### 1. Add .npmignore file
```
# Development files
*.log
.DS_Store
.env*
coverage/
test/

# Source control
.git/
.gitignore

# IDE
.vscode/
.idea/

# Development dependencies
node_modules/
```

#### 2. Enable 2FA on npm account
```bash
npm profile enable-2fa auth-and-writes
```

#### 3. Use npm audit
```bash
npm audit
npm audit fix
```

### 📊 Post-Publishing Checklist

✅ **Test installation**: `npm install -g your-package-name`  
✅ **Test commands**: Run the CLI commands  
✅ **Check npm page**: Visit npmjs.com/package/your-package-name  
✅ **Update documentation**: Add installation instructions  
✅ **Share with community**: Tweet, post in forums  

### 🎉 Success! Your package is now available

Users can install it with:
```bash
# Global installation
npm install -g your-package-name

# One-time usage
npx your-package-name
```

### 🔧 Troubleshooting

**Error: Package already exists**
- Change the package name in `package.json`
- Use a scoped package: `@yourusername/package-name`

**Error: Authentication failed**
- Run `npm logout` then `npm login`
- Check 2FA settings

**Error: Permission denied**
- Use `sudo` for global installs (not recommended)
- Better: Configure npm to use a different directory

**Error: Invalid package.json**
- Validate JSON syntax
- Ensure required fields are present

### 📈 Promoting Your Package

1. **Add badges to README**:
   ```markdown
   ![npm version](https://badge.fury.io/js/your-package-name.svg)
   ![npm downloads](https://img.shields.io/npm/dm/your-package-name.svg)
   ```

2. **Submit to awesome lists**
3. **Post on Reddit** (r/node, r/javascript)
4. **Share on Twitter/LinkedIn**
5. **Add to your GitHub profile**

---

🎊 **Congratulations! You're now an npm package publisher!** 🎊
