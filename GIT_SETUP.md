# Git Repository Setup Guide

## Initial Setup

### 1. Initialize Git Repository
```bash
git init
```

### 2. Add All Files
```bash
git add .
```

### 3. Create Initial Commit
```bash
git commit -m "Initial commit: AI Image & Video Generator MERN stack project

- Backend API with Express.js and MongoDB
- User authentication with JWT
- Image generation with multiple AI models (OpenAI, Replicate)
- Video generation from image sequences
- Project management system
- File upload and storage with Cloudinary"
```

## Branch Strategy

### Main Branches
```bash
# Create and switch to development branch
git checkout -b develop

# Create feature branch for new features
git checkout -b feature/user-authentication
git checkout -b feature/image-generation
git checkout -b feature/video-generation
```

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `refactor/component-name` - Code refactoring

## Remote Repository Setup

### GitHub (Recommended)
1. Go to https://github.com
2. Create a new repository
3. Don't initialize with README (we already have one)
4. Copy the repository URL

### Add Remote and Push
```bash
# Add remote repository
git remote add origin https://github.com/yourusername/ai-image-generator.git

# Push to GitHub
git push -u origin main

# Push development branch
git checkout develop
git push -u origin develop
```

## Git Configuration

### Set Up Your Identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Create .gitignore (Already created)
The `.gitignore` file is already set up to exclude:
- `.env` files (environment variables)
- `node_modules/` (dependencies)
- Build outputs
- Log files
- Upload directories

## Development Workflow

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature description"

# Push feature branch
git push -u origin feature/new-feature

# Create pull request on GitHub
# After review and merge, delete feature branch
```

### Commit Message Convention
Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## Useful Git Commands

### Status and History
```bash
# Check status
git status

# View commit history
git log --oneline

# View changes in last commit
git show
```

### Branch Management
```bash
# List all branches
git branch -a

# Switch to branch
git checkout branch-name

# Create and switch to new branch
git checkout -b new-branch-name

# Delete local branch
git branch -d branch-name
```

### Stashing
```bash
# Save changes temporarily
git stash

# List stashes
git stash list

# Apply last stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

### Merging and Rebasing
```bash
# Merge feature branch into develop
git checkout develop
git merge feature/feature-name

# Rebase feature branch
git checkout feature/feature-name
git rebase develop
```

## Pre-commit Checklist

Before committing, ensure:
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] No sensitive data in commits
- [ ] Meaningful commit message
- [ ] `.env` file is not included

## Security Best Practices

### Never Commit Sensitive Data
- ✅ Environment variables (`.env`)
- ✅ API keys and secrets
- ✅ Database credentials
- ✅ Private keys

### Use Environment Variables
```bash
# Example .env file (DO NOT COMMIT)
MONGODB_URI=mongodb://localhost:27017/ai-image-generator
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-api-key
```

## Collaboration Guidelines

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch to remote
4. Create pull request
5. Request review
6. Address feedback
7. Merge after approval

### Code Review Checklist
- [ ] Code is readable and well-documented
- [ ] No security vulnerabilities
- [ ] Error handling is appropriate
- [ ] Tests are included
- [ ] Performance considerations

## Deployment Considerations

### Environment-Specific Configs
```bash
# Development
.env.development

# Production
.env.production

# Staging
.env.staging
```

### CI/CD Setup
Consider setting up GitHub Actions for:
- Automated testing
- Code quality checks
- Deployment to staging/production

## Troubleshooting

### Reset to Previous Commit
```bash
# Soft reset (keep changes)
git reset --soft HEAD~1

# Hard reset (discard changes)
git reset --hard HEAD~1
```

### Fix Last Commit Message
```bash
git commit --amend -m "New commit message"
```

### Recover Deleted Branch
```bash
# Find the commit hash
git reflog

# Recreate branch
git checkout -b recovered-branch commit-hash
``` 