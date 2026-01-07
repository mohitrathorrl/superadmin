# 📊 Database Setup Guide - Existing Structure

## ✅ Your Current Database Structure:

You already have these tables in `salarykart_lms`:

### 1. `sup_root_admin` - Root Admin Users
```sql
CREATE TABLE `sup_root_admin` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);
```

**Current Users**:
- mohit.rathor@rupeelending.com (Root Super Admin)

---

### 2. `sup_admin_users` - Super Admin Users
```sql
CREATE TABLE `sup_admin_users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);
```

**Current Users**:
- pankaj.sharma@rupeelending.com (Pankaj Sharma)
- Kamal.joshi@rupeelending.com (Kamal Joshi)

---

### 3. `sup_login_otp` - OTP Storage
```sql
CREATE TABLE `sup_login_otp` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `role` enum('root','superadmin') NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `email` (`email`)
);
```

---

## ✅ No Need to Create Tables!

**Your database is already set up!** Just verify:

```bash
mysql -u root -p

USE salarykart_lms;

# Check all tables
SHOW TABLES;

# Should show:
# - sup_admin_users
# - sup_login_otp
# - sup_root_admin
```

---

## 🔧 How the System Works:

### Login Flow:

1. **User enters email**: mohit.rathor@rupeelending.com
2. **System checks**:
   - First in `sup_root_admin` table
   - Then in `sup_admin_users` table
3. **If found**:
   - Generate 6-digit OTP
   - Store in `sup_login_otp` table
   - Send email via Gmail
4. **User enters OTP**:
   - Verify from `sup_login_otp`
   - Check expiry (10 minutes)
   - Check if already used
5. **If valid**:
   - Mark OTP as used
   - Generate JWT token (1 hour expiry)
   - Set httpOnly cookie
   - Redirect to dashboard

---

## 👥 Test Users:

### Root Admin:
- **Email**: mohit.rathor@rupeelending.com
- **Name**: Root Super Admin
- **Role**: root

### Super Admins:
- **Email**: pankaj.sharma@rupeelending.com
- **Name**: Pankaj Sharma
- **Role**: superadmin

- **Email**: Kamal.joshi@rupeelending.com
- **Name**: Kamal Joshi
- **Role**: superadmin

---

## 📧 Email Configuration:

### Update `.env.local`:
```bash
# Gmail credentials for sending OTP
EMAIL_USER=mohit.rathor@rupeelending.com
EMAIL_APP_PASSWORD=your-gmail-app-password
```

### Get Gmail App Password:
1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Create new: Mail → Other (Custom name)
5. Copy the 16-character password
6. Paste in `.env.local`

---

## ✅ Testing:

### Test OTP Send:
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "mohit.rathor@rupeelending.com"}'

# Expected Response:
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

### Test OTP Verify:
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "mohit.rathor@rupeelending.com", "otp": "123456"}'

# Expected Response:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Root Super Admin",
    "email": "mohit.rathor@rupeelending.com",
    "role": "root"
  }
}
```

---

## 🐞 Common Issues:

### Error: "Unexpected token '<', '<!DOCTYPE'..."

**Cause**: API returning HTML instead of JSON

**Fix**:
1. Check MySQL is running: `mysql -u root -p -e "SELECT 1;"`
2. Check database exists: `mysql -u root -p -e "SHOW DATABASES LIKE 'salarykart_lms';"`
3. Check tables exist: `mysql -u root -p salarykart_lms -e "SHOW TABLES;"`
4. Restart dev server: `npm run dev`

---

### Error: "User not found"

**Fix**: Check if user exists:
```sql
USE salarykart_lms;

-- Check root admin
SELECT * FROM sup_root_admin WHERE email = 'mohit.rathor@rupeelending.com';

-- Check super admin
SELECT * FROM sup_admin_users WHERE email = 'pankaj.sharma@rupeelending.com';
```

---

### Error: "Failed to send email"

**Fix**:
1. Check `.env.local` has correct Gmail credentials
2. Verify Gmail App Password (16 characters)
3. Check 2-Step Verification is enabled
4. Try with a different Gmail account

---

## 🚀 Quick Start:

```bash
# 1. Pull latest code
git pull origin feature/production-ready-otp-email-jwt-fixes

# 2. Install dependencies
npm install mysql2

# 3. Update .env.local (add Gmail credentials)
nano .env.local

# 4. Verify database
mysql -u root -p salarykart_lms -e "SHOW TABLES;"

# 5. Clear cache
rm -rf .next

# 6. Start server
npm run dev

# 7. Test login
# Open: http://localhost:3000
# Enter: mohit.rathor@rupeelending.com
# Get OTP on email
# Verify OTP
# Success! 🎉
```

---

## ✅ Database is Ready!

**No need to run any SQL scripts!**

Your existing database structure is perfect. Just:
1. Update `.env.local` with Gmail credentials
2. Pull latest code
3. Run `npm run dev`
4. Test login!

**Everything will work! 🔥**
