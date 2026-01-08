# 🚀 Production Deployment Guide

## 📊 Database Connection Fixed!

Yeh guide production deployment ke liye step-by-step instructions provide karta hai.

---

## ✅ Pre-Deployment Checklist

### 1. Server Requirements
- Node.js 18.x or higher
- MySQL 8.0 or higher
- Minimum 2GB RAM
- PM2 for process management (recommended)

### 2. Database Setup

```sql
-- Create database
CREATE DATABASE lms_v2;

-- Create user (if not exists)
CREATE USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';

-- Grant privileges
GRANT ALL PRIVILEGES ON lms_v2.* TO 'salarykart_admin'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🛠️ Installation Steps

### Step 1: Clone Repository

```bash
git clone https://github.com/mohitrathorrl/superadmin.git
cd superadmin
git checkout fix/production-db-connection-and-deployment
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note:** npm install ab hang nahi hoga! DB connection lazy-loaded hai.

### Step 3: Environment Configuration

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your production values
nano .env.local
```

**Production .env.local:**

```env
# Database
DB_HOST=localhost
DB_USER=salarykart_admin
DB_PASSWORD=sal@ryk@rt*&#2024
DB_NAME=lms_v2
DB_CONNECTION_LIMIT=20

# JWT Secret (generate new one!)
JWT_SECRET=your_production_jwt_secret_here

# Email
EMAIL_USER=it@rupeelending.com
EMAIL_APP_PASSWORD=zgwy yptg isge ugvd
EMAIL_FROM_NAME=RupeeLending

# URLs (update with your domain)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Environment
NODE_ENV=production
```

### Step 4: Test Database Connection

```bash
# Start dev server to test
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-08T12:54:14.000Z",
  "database": {
    "success": true,
    "message": "Database connected"
  },
  "environment": "production",
  "version": "2.1.0"
}
```

### Step 5: Build for Production

```bash
npm run build
```

**Build ab hang nahi hoga!** DB connection build-time pe execute nahi hota.

### Step 6: Start Production Server

#### Option A: Direct Start
```bash
npm start
```

#### Option B: Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start npm --name "superadmin" -- start

# Save PM2 process list
pm2 save

# Auto-start on server reboot
pm2 startup
```

---

## 🔍 Troubleshooting

### Issue: Database Connection Failed

**Check:**
1. MySQL service running: `systemctl status mysql`
2. Credentials correct in `.env.local`
3. Database exists: `mysql -u salarykart_admin -p -e "SHOW DATABASES;"`
4. Network connectivity: `telnet localhost 3306`

**Test:**
```bash
curl http://localhost:3000/api/health
```

### Issue: Build Hanging

**Solution:** This is fixed! But if still happens:
1. Clear Next.js cache: `rm -rf .next`
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check `.env.local` exists and has correct values

### Issue: Port Already in Use

```bash
# Find process using port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in package.json
"start": "next start -p 3002"
```

---

## 🔒 Security Best Practices

### 1. Generate New JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output to `JWT_SECRET` in `.env.local`

### 2. Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3001/tcp  # App (if needed)
sudo ufw enable
```

### 3. Database Security

```sql
-- Remove remote root access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1');

-- Set strong password for admin user
ALTER USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'your_strong_password';

FLUSH PRIVILEGES;
```

---

## 📊 Monitoring & Logs

### PM2 Commands

```bash
# View logs
pm2 logs superadmin

# Monitor resources
pm2 monit

# Restart app
pm2 restart superadmin

# Stop app
pm2 stop superadmin

# View process list
pm2 list
```

### Application Logs

```bash
# View Next.js logs
tail -f .next/trace

# View PM2 logs
pm2 logs --lines 100
```

---

## 🔄 Update & Rollback

### Update to Latest Version

```bash
# Pull latest changes
git pull origin fix/production-db-connection-and-deployment

# Install dependencies
npm install

# Rebuild
npm run build

# Restart PM2
pm2 restart superadmin
```

### Rollback

```bash
# View commit history
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>

# Rebuild and restart
npm run build
pm2 restart superadmin
```

---

## ✅ Post-Deployment Verification

### 1. Health Check
```bash
curl https://yourdomain.com/api/health
```

### 2. Login Test
1. Open https://yourdomain.com
2. Should redirect to /login
3. Enter email, receive OTP
4. Verify OTP, login successful

### 3. Database Connectivity
```bash
# Check active connections
mysql -u salarykart_admin -p -e "SHOW PROCESSLIST;"
```

---

## 📞 Support

If issues persist:
1. Check `/api/health` endpoint
2. Review PM2 logs: `pm2 logs`
3. Check MySQL logs: `/var/log/mysql/error.log`
4. Contact: it@rupeelending.com

---

## 🎉 Deployment Complete!

Your application is now production-ready with:
- ✅ Fixed database connection (no more hanging!)
- ✅ Lazy-loaded DB pool
- ✅ Health check endpoint
- ✅ Production-optimized build
- ✅ Secure environment variables
- ✅ PM2 process management

Happy deploying! 🚀
