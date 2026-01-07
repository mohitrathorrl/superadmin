# 🚀 Installation & Setup Guide

Complete step-by-step guide to get superadmin_dashbaord Fintech Dashboard running locally.

## 📄 Requirements

- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **Git**: For cloning the repository
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## 📁 Step 1: Clone Repository

```bash
# Clone the repo
git clone https://github.com/mohitrathorrl/dashboard.git

# Navigate to project
cd dashboard
```

## 🖋️ Step 2: Install Dependencies

```bash
# Install all packages
npm install

# Verify installation (should see no errors)
npm list
```

**Dependencies Installed:**
- next
- react
- tailwindcss
- lucide-react
- sonner
- shadcn/ui components

## 🚀 Step 3: Start Development Server

```bash
# Start dev server
npm run dev

# Server will start on http://localhost:3000
# Output should show:
# > next dev
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 🤋 Step 4: Access Dashboard

### Login First

1. **Open browser**: http://localhost:3000
2. **You'll be redirected to**: http://localhost:3000/login
3. **Login with demo credentials:**
   ```
   Email: admin@superadmin_dashbaord.com
   Password: password123
   ```
4. **Click** "Sign In" button

### After Login

You'll be redirected to the dashboard home page.

## 👊 Step 5: Explore Features

### Sidebar Navigation

Click on menu items in the sidebar:

1. **Overview** - Dashboard home with stats
2. **Admin Tools** → Website Config - Manage site configurations
3. **DB Tools**
   - **Manage FOIR** - Fixed Obligation to Income Ratio
   - **Manage NBFC** - Non-Banking Financial Company
4. **Users** → Manage IFSC Codes - Bank IFSC code management
5. **Transactions** - Transaction history
6. **Customers** - Customer management
7. **Settings** - Account settings

### Try CRUD Operations

**On any CRUD page (Website Config, FOIR, NBFC, IFSC Codes):**

1. **Add** - Click "Add..." button to open modal
2. **Fill Form** - Enter required information
3. **Save** - Click Save button
4. **View** - See item in list/table
5. **Edit** - Click edit icon to modify
6. **Delete** - Click delete icon to remove

## 🛠️ Available Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code (if prettier configured)
npm run format
```

## 📊 Project Structure

```
superadmin_dashbaord-dashboard/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.js              # Login page
│   │   ├── dashboard/
│   │   │   ├── page.js              # Dashboard home
│   │   │   ├── admin/website-config/
│   │   │   ├── db-tools/foir/
│   │   │   ├── db-tools/nbfc/
│   │   │   ├── users/ifsc-codes/
│   │   │   ├── transactions/
│   │   │   ├── customers/
│   │   │   └── settings/
│   │   ├── layout.js              # Root layout
│   │   ├── page.js                # Redirect to /dashboard
│   │   └── globals.css            # Global styles
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.jsx
│   │   │   └── topbar.jsx
│   │   ├── ui/
│   │   └── providers/
│   ├── context/
│   │   └── auth-context.js       # Auth state
│   └── lib/
│       └── utils.js
├── public/
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 📱 Testing Features

### Test Login
1. Go to http://localhost:3000/login
2. Enter demo credentials
3. Click Sign In
4. Should redirect to `/dashboard`

### Test Navbar
1. Check top-right corner for:
   - superadmin_dashbaord logo with money emoji
   - User name and role
   - Logout button

### Test Sidebar
1. View left sidebar with:
   - superadmin_dashbaord logo at top
   - Collapsible menu sections
   - Active page highlight

### Test CRUD
1. Go to **Website Config** page
2. Click **Add Config**
3. Fill form and save
4. Verify toast notification
5. See new item in table
6. Click edit to modify
7. Click delete to remove
8. Repeat for other CRUD pages

### Test Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test at different sizes:
   - Mobile: 375px
   - Tablet: 768px
   - Desktop: 1024px+
4. Verify sidebar becomes drawer on mobile

## 🔍 Troubleshooting

### Issue: Port 3000 already in use
```bash
# Use different port
npm run dev -- -p 3001
# Visit http://localhost:3001
```

### Issue: "Module not found" error
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Tailwind styles not applying
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Login not working
1. Check localStorage is enabled in browser
2. Verify using demo credentials
3. Check browser console for errors (F12)

### Issue: Modals not opening
1. Check if JavaScript is enabled
2. Open browser console for errors
3. Clear browser cache (Ctrl+Shift+Delete)

## 📚 Documentation

After installation, explore:

- **README.md** - Project overview
- **FEATURES.md** - All features documented
- **DEVELOPMENT.md** - Coding standards
- **QUICK_START.md** - Quick reference

## 🚀 Next Steps

1. **Explore** - Test all pages and features
2. **Customize** - Modify colors, fonts in globals.css
3. **Integrate** - Connect to your backend API
4. **Deploy** - Push to GitHub and deploy to Vercel

## 🚰️ Need Help?

1. Check **Troubleshooting** section above
2. Review **FEATURES.md** for feature details
3. Check **DEVELOPMENT.md** for code patterns
4. Check browser console (F12) for errors
5. Check Next.js docs: https://nextjs.org/docs

## 🎉 You're Ready!

Your superadmin_dashbaord Fintech Dashboard is now running! 🚀

Happy coding! ✍️
