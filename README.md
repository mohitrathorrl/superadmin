# 💰 superadmin_dashbaord Fintech Dashboard

> Modern, responsive fintech admin dashboard with complete CRUD operations, authentication, and role-based access control.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)

---

## 🚀 Features

### 🔐 Authentication
- ✅ Login page with demo credentials
- ✅ User context management
- ✅ Role-based access (Admin/User)
- ✅ Logout functionality
- ✅ Session persistence

### 💎 UI/UX
- ✅ Beautiful modern design
- ✅ Fully responsive layout
- ✅ Smooth animations
- ✅ Accessible components
- ✅ User & role display in navbar

### 📊 Dashboard Pages
- **Overview** - Statistics dashboard
- **Admin Tools** - Website configuration CRUD
- **DB Tools** - FOIR & NBFC management with CRUD
- **Users** - IFSC code management with search
- **Transactions** - Transaction history
- **Customers** - Customer management
- **Settings** - Account settings

### 🔄 CRUD Operations (4 Pages)
1. **Website Config** - Key/value configuration management
2. **FOIR** - Fixed Obligation to Income Ratio management
3. **NBFC** - Non-Banking Financial Company management
4. **IFSC Codes** - Bank IFSC code management with search

**All pages include:**
- ✅ Create - Add button with modal form
- ✅ Read - View in table/card layout
- ✅ Update - Edit button with pre-filled modal
- ✅ Delete - Delete button with confirmation
- ✅ Validation - Form field validation
- ✅ Notifications - Toast feedback

### 🎯 Sidebar Navigation
```
💰 superadmin_dashbaord Fintech
  │
  🔍 Overview
  🐨 Admin Tools
  │   └─ Website Config (CRUD)
  📋 DB Tools
  │   ├─ Manage FOIR (CRUD)
  │   └─ Manage NBFC (CRUD)
  👥 Users
  │   └─ IFSC Codes (CRUD + Search)
  📑 Transactions
  👤 Customers
  ⚙️ Settings
```

---

## 📋 Quick Start

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- npm 8+
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/mohitrathorrl/dashboard.git
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access Dashboard

1. Open [http://localhost:3000](http://localhost:3000)
2. Login with demo credentials:
   - **Email:** admin@superadmin_dashbaord.com
   - **Password:** password123

---

## 🗑️ Demo Credentials

| Field | Value |
|-------|-------|
| Email | admin@superadmin_dashbaord.com |
| Password | password123 |
| Role | Admin |
| Name | Admin User |

---

## 🏗️ Project Structure

```
superadmin_dashbaord-dashboard/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.js                    # Authentication page
│   │   ├── dashboard/
│   │   │   ├── admin/website-config/
│   │   │   │   └── page.js              # Website Config CRUD
│   │   │   ├── db-tools/
│   │   │   │   ├── foir/page.js         # FOIR CRUD
│   │   │   │   └── nbfc/page.js         # NBFC CRUD
│   │   │   ├── users/
│   │   │   │   └── ifsc-codes/page.js   # IFSC Codes CRUD
│   │   │   ├── transactions/page.js    # Transactions
│   │   │   ├── customers/page.js       # Customers
│   │   │   ├── settings/page.js        # Settings
│   │   │   └── page.js                 # Overview
│   │   ├── layout.js                   # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── sidebar.jsx              # Navigation
│   │   │   └── topbar.jsx               # Top navbar
│   │   └── ui/                         # UI components
│   ├── context/
│   │   └── auth-context.js            # Auth state
│   └── lib/
├── public/
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## 📚 Documentation

| File | Content |
|------|----------|
| [FEATURES.md](./FEATURES.md) | Complete feature list |
| [INSTALLATION.md](./INSTALLATION.md) | Setup & installation guide |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Problem solving guide |
| [FIX_SUMMARY.md](./FIX_SUMMARY.md) | All fixes applied |

---

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start dev server

# Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code
```

---

## 💎 Design System

### Colors
- **Primary:** Black (#000000)
- **Text:** Zinc-900 (#181a1b)
- **Borders:** Zinc-200 (#e4e4e7)
- **Background:** White (#FFFFFF)
- **Success:** Green-500 (#22c55e)
- **Error:** Red-500 (#ef4444)
- **Warning:** Amber-500 (#f59e0b)

### Responsive Breakpoints
- **Mobile:** 0px
- **Tablet:** 768px
- **Desktop:** 1024px
- **Large:** 1280px

---

## ✨ Recent Fixes (Dec 13, 2025)

✅ **All Issues Resolved:**
- Fixed CSS merge conflict errors
- Removed metadata viewport warnings
- Updated all pages to Next.js 14 standards
- Added comprehensive documentation
- Verified production-ready code

See [FIX_SUMMARY.md](./FIX_SUMMARY.md) for details.

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Tablet optimized
- ✅ Desktop fullscreen
- ✅ Flexible sidebar (drawer on mobile)
- ✅ Responsive tables
- ✅ Full-screen modals on mobile

---

## 🧪 Browser Support

| Browser | Support |
|---------|----------|
| Chrome/Edge | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Mobile | ✅ Responsive |

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
git push origin main
# Visit: https://vercel.com
# Select your repository and click Deploy
```

### Deploy to Other Platforms

```bash
npm run build
npm run start
```

---

## 🤝 Contributing

Contributions welcome!

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file

---

## 👨‍💻 Tech Stack

- **Framework:** Next.js 14
- **React:** v18
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Notifications:** Sonner
- **Components:** shadcn/ui
- **State:** React Context API

---

## 📋 Project Status

- ✅ Development: Complete
- ✅ Testing: Complete
- ✅ Documentation: Complete
- ✅ Production Ready: Yes

---

**Last Updated:** December 13, 2025

**Version:** 1.0.0

---

**Built with ❤️ for fintech teams who demand production-grade dashboards.** 🚀
