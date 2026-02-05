# 🔍 Database Connection Troubleshooting

## ❌ Error: Access denied for user 'salarykart_admin'@'localhost'

Yeh error tab aata hai jab:
1. User exist nahi karta
2. Password galat hai
3. User ko database access nahi hai

---

## ✅ Step-by-Step Fix

### Step 1: MySQL mein Login karo (as root)

```bash
sudo mysql -u root -p
```

Ya agar root password nahi hai:
```bash
sudo mysql
```

### Step 2: Check if User Exists

```sql
SELECT User, Host FROM mysql.user WHERE User = 'salarykart_admin';
```

**Agar empty result aaya:**
User exist nahi karta, create karo (Step 3)

**Agar user dikh raha hai:**
Password reset karo (Step 4)

---

### Step 3: Create User (Agar exist nahi karta)

```sql
-- Create user with password
CREATE USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';

-- Verify user created
SELECT User, Host FROM mysql.user WHERE User = 'salarykart_admin';
```

---

### Step 4: Reset Password (Agar user exist karta hai)

```sql
-- MySQL 8.0+
ALTER USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';

-- MySQL 5.7
SET PASSWORD FOR 'salarykart_admin'@'localhost' = PASSWORD('sal@ryk@rt*&#2024');

-- Flush privileges
FLUSH PRIVILEGES;
```

---

### Step 5: Create Database

```sql
-- Check if database exists
SHOW DATABASES LIKE 'lms_v2';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS lms_v2;

-- Verify
SHOW DATABASES;
```

---

### Step 6: Grant Permissions

```sql
-- Grant all privileges on lms_v2 database
GRANT ALL PRIVILEGES ON lms_v2.* TO 'salarykart_admin'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- Verify grants
SHOW GRANTS FOR 'salarykart_admin'@'localhost';
```

**Expected Output:**
```
+------------------------------------------------------------------------+
| Grants for salarykart_admin@localhost                                  |
+------------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `salarykart_admin`@`localhost`                  |
| GRANT ALL PRIVILEGES ON `lms_v2`.* TO `salarykart_admin`@`localhost`  |
+------------------------------------------------------------------------+
```

---

### Step 7: Test Connection from Terminal

```bash
# Exit MySQL
exit;

# Test connection with new user
mysql -u salarykart_admin -p'sal@ryk@rt*&#2024' lms_v2
```

**Agar successful login hua:**
```sql
-- Test query
SHOW TABLES;

-- Exit
exit;
```

---

### Step 8: Update .env.local

```bash
cd /path/to/superadmin
nano .env.local
```

**Verify these exact values:**
```env
DB_HOST=localhost
DB_USER=salarykart_admin
DB_PASSWORD=sal@ryk@rt*&#2024
DB_NAME=lms_v2
DB_CONNECTION_LIMIT=20
```

⚠️ **Important:** 
- No spaces before/after `=`
- No quotes around password
- Exact password with special characters

---

### Step 9: Test Application

```bash
# Restart application
pm2 restart superadmin

# Or if using npm start
npm start

# Test health endpoint
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": {
    "success": true,
    "message": "Database connected"
  }
}
```

---

## 🔧 Common Issues & Solutions

### Issue 1: Special Characters in Password

**Problem:** Password mein `*`, `#`, `@` jaise characters hain

**Solution:**
```sql
-- Use backticks or single quotes
CREATE USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';
```

### Issue 2: User exists but password wrong

```sql
-- Drop and recreate user
DROP USER IF EXISTS 'salarykart_admin'@'localhost';
CREATE USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';
GRANT ALL PRIVILEGES ON lms_v2.* TO 'salarykart_admin'@'localhost';
FLUSH PRIVILEGES;
```

### Issue 3: Permission denied even after grants

```sql
-- Flush privileges
FLUSH PRIVILEGES;

-- Restart MySQL service
```

```bash
sudo systemctl restart mysql
```

### Issue 4: Connection from different host

Agar application alag server se connect kar raha hai:

```sql
-- Create user for specific IP
CREATE USER 'salarykart_admin'@'192.168.1.%' IDENTIFIED BY 'sal@ryk@rt*&#2024';
GRANT ALL PRIVILEGES ON lms_v2.* TO 'salarykart_admin'@'192.168.1.%';
FLUSH PRIVILEGES;
```

Update `.env.local`:
```env
DB_HOST=192.168.1.25  # Your MySQL server IP
```

---

## 🧪 Quick Test Script

Create `test-db.js` in project root:

```javascript
const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'salarykart_admin',
      password: 'sal@ryk@rt*&#2024',
      database: 'lms_v2'
    });
    
    console.log('✅ Connection successful!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testDB();
```

Run:
```bash
node test-db.js
```

---

## 📋 Complete Setup Script

MySQL mein yeh complete script run karo:

```sql
-- Complete setup script
DROP DATABASE IF EXISTS lms_v2;
DROP USER IF EXISTS 'salarykart_admin'@'localhost';

CREATE DATABASE lms_v2;
CREATE USER 'salarykart_admin'@'localhost' IDENTIFIED BY 'sal@ryk@rt*&#2024';
GRANT ALL PRIVILEGES ON lms_v2.* TO 'salarykart_admin'@'localhost';
FLUSH PRIVILEGES;

-- Verify
SELECT User, Host FROM mysql.user WHERE User = 'salarykart_admin';
SHOW GRANTS FOR 'salarykart_admin'@'localhost';
```

---

## ✅ Final Checklist

- [ ] MySQL service running: `systemctl status mysql`
- [ ] Database `lms_v2` exists: `SHOW DATABASES;`
- [ ] User `salarykart_admin` exists: `SELECT User FROM mysql.user;`
- [ ] User has permissions: `SHOW GRANTS FOR 'salarykart_admin'@'localhost';`
- [ ] Password is correct: `mysql -u salarykart_admin -p lms_v2`
- [ ] `.env.local` has correct credentials
- [ ] No extra spaces in `.env.local`
- [ ] Application restarted after changes

---

## 🆘 Still Not Working?

### Check MySQL Error Log

```bash
sudo tail -f /var/log/mysql/error.log
```

### Check Application Logs

```bash
pm2 logs superadmin --lines 50
```

### Verify MySQL Authentication Plugin

```sql
SELECT User, Host, plugin FROM mysql.user WHERE User = 'salarykart_admin';
```

**If plugin is not `mysql_native_password`:**
```sql
ALTER USER 'salarykart_admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sal@ryk@rt*&#2024';
FLUSH PRIVILEGES;
```

---

**Iske baad bhi problem hai toh MySQL version check karo:**
```bash
mysql --version
```

Aur error logs share karo for further debugging!
