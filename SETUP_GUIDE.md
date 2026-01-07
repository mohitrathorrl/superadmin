# 🚀 Complete Setup Guide

## Prerequisites
- Node.js 18+ installed
- MySQL database running
- Git installed

## Step 1: Pull Latest Changes from GitHub

```bash
# Navigate to your project directory
cd /path/to/superadmin

# Pull the latest changes
git pull origin main

# If you have local changes, stash them first
git stash
git pull origin main
git stash pop
```

## Step 2: Install New Dependencies

```bash
# Install jose library for JWT
npm install jose

# Or if you prefer to install all dependencies
npm install
```

## Step 3: Generate JWT Secret

Run this command to generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output (it will look like: `a1b2c3d4e5f6...`)

## Step 4: Configure Environment Variables

### Create `.env.local` file:

```bash
# Copy the example file
cp .env.example .env.local
```

### Edit `.env.local` and add your values:

```env
# Paste the secret you generated in Step 3
JWT_SECRET=your_generated_secret_from_step_3

# Your existing database configuration
DATABASE_URL=mysql://username:password@localhost:3306/database_name

# Application settings
NEXT_PUBLIC_APP_URL=http://localhost:3001
NODE_ENV=development

# Rate limiting (optional - defaults are fine)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Email configuration (if using nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

## Step 5: Verify Installation

```bash
# Check if jose is installed
npm list jose

# Should show: jose@5.2.0 or higher
```

## Step 6: Start Development Server

```bash
# Start the server
npm run dev

# Your app will run on http://localhost:3001
```

## Step 7: Test Authentication

1. Go to `http://localhost:3001/login`
2. Enter your email
3. Get OTP from email
4. Verify OTP
5. You should be logged in with JWT token set in cookies

## Verification Checklist

✅ **Check if everything is working:**

```bash
# 1. Check if .env.local exists
ls -la .env.local

# 2. Verify JWT_SECRET is set (don't print the actual value)
node -e "console.log(process.env.JWT_SECRET ? '✅ JWT_SECRET is set' : '❌ JWT_SECRET missing')"

# 3. Check if jose is installed
npm list jose

# 4. Test database connection
npm run dev
```

## Troubleshooting

### Error: "JWT_SECRET is not defined"
**Solution:** Make sure `.env.local` file exists and JWT_SECRET is set

```bash
echo "JWT_SECRET=$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')" >> .env.local
```

### Error: "Cannot find module 'jose'"
**Solution:** Install jose package

```bash
npm install jose
```

### Error: "Cookie not being set"
**Solution:** Check browser console and network tab
- Make sure sameSite is 'strict'
- Check if httpOnly is true
- Verify domain matches

### Error: "Rate limit exceeded"
**Solution:** Wait 15 minutes or clear rate limit

```bash
# Restart the server to clear rate limits
npm run dev
```

## Git Commands Reference

```bash
# Pull latest changes
git pull origin main

# Check current status
git status

# Stash local changes
git stash

# Apply stashed changes
git stash pop

# View commit history
git log --oneline -5

# View changed files
git diff

# Discard local changes (careful!)
git reset --hard origin/main
```

## Security Checklist

- ✅ JWT_SECRET is generated and secure (32+ characters)
- ✅ `.env.local` is in `.gitignore` (never commit secrets)
- ✅ Cookies are httpOnly and secure
- ✅ Rate limiting is enabled
- ✅ CORS is properly configured
- ✅ Database credentials are secure

## Production Deployment

When deploying to production:

1. **Set environment variables** in your hosting platform
2. **Generate new JWT_SECRET** for production
3. **Enable HTTPS** (required for secure cookies)
4. **Update NEXT_PUBLIC_APP_URL** to production URL
5. **Set NODE_ENV=production**

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Important Files Changed

- ✅ `middleware.js` - Enhanced with rate limiting and JWT verification
- ✅ `src/lib/security.js` - Security utilities
- ✅ `src/lib/jwt.js` - JWT helper functions
- ✅ `src/app/api/auth/verify-otp/route.js` - Updated login API
- ✅ `src/app/api/auth/logout/route.js` - Updated logout API
- ✅ `package.json` - Added jose dependency
- ✅ `tailwind.config.js` - Enhanced typography
- ✅ `.env.example` - Environment template

## Support

If you face any issues:
1. Check the TROUBLESHOOTING.md file
2. Review the SECURITY.md documentation
3. Contact: mohitrathorrl@gmail.com

---

**🎉 Setup Complete!** Your app now has enterprise-grade security! 🔐
