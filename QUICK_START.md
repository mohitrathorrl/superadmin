# 🚀 Quick Start Guide

Get the superadmin_dashbaord Fintech Dashboard running in **5 minutes**.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git

## 1. Clone & Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/mohitrathorrl/dashboard.git
cd dashboard

# Install dependencies
npm install
```

## 2. Start Development Server (1 minute)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: The home page (`/`) automatically redirects to `/dashboard`

## 3. Explore the Dashboard (2 minutes)

### Available Routes

| Route | Description |
|-------|-------------|
| `http://localhost:3000` | Redirects to /dashboard |
| `http://localhost:3000/dashboard` | Dashboard home with stats |
| `http://localhost:3000/dashboard/transactions` | View all transactions |
| `http://localhost:3000/dashboard/customers` | Manage customers |
| `http://localhost:3000/dashboard/settings` | Account settings |

### Interactive Features

- **Sidebar Navigation** - Click items to navigate (desktop)
- **Mobile Menu** - Click hamburger icon on mobile screens
- **New Payout Button** - Click to see toast notification
- **Search** - Try searching in Customers page
- **Filters** - Click Filter button in Transactions page

## Project Structure Quick Reference

```
dashboard/
├── src/
│   ├── app/              ← Pages and layouts
│   ├── components/       ← React components
│   └── lib/              ← Utilities
├── public/            ← Static files
├── package.json
├── README.md          ← Full documentation
├── DEVELOPMENT.md     ← Development guide
└── FIXES_APPLIED.md   ← What was fixed
```

## Common Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Format code with Prettier
npm run format
```

## File Naming Quick Rules

```
✅ Pages:        page.js
✅ Layouts:      layout.js
✅ Components:   ComponentName.jsx
✅ Utilities:    util-name.js
✅ Hooks:        use-hook-name.js
❌ WRONG:        MyPage.js or component.jsx
```

## Using Tailwind CSS

All styling uses Tailwind classes:

```jsx
// Layout
<div className="flex items-center gap-4 p-6">

// Colors - use Tailwind directly
<p className="text-zinc-600 bg-white">

// Responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

// Reusable utilities (from globals.css)
<div className="surface">         {/* Card styling */}
<button className="btn-primary"> {/* Black button */}
<span className="badge-success"> {/* Status badge */}
```

## Folder Structure for New Pages

To add a new dashboard page:

```
src/app/dashboard/new-page/
├── page.js      ← Your page content
└── layout.js    ← Page-specific layout (optional)
```

Then add to sidebar in `src/components/dashboard/sidebar.jsx`:

```jsx
const navItems = [
  // ... existing items
  {
    label: "New Page",
    href: "/dashboard/new-page",
    icon: "🏷️",
  },
]
```

## Debugging Tips

### Port 3000 already in use?

```bash
npm run dev -- -p 3001
```

### Tailwind styles not working?

```bash
# Clear Next.js cache and restart
rm -rf .next
npm run dev
```

### Component not rendering?

Check that your component is properly exported:

```jsx
// ✅ Correct
export function ComponentName() {
  return <div>Content</div>
}

// ❌ Wrong - missing export
function ComponentName() {
  return <div>Content</div>
}
```

## Production Deployment

### Build

```bash
npm run build
```

### Test Production Build Locally

```bash
npm run build
npm run start
# Open http://localhost:3000
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repository
5. Click "Deploy"

> Vercel auto-deploys on every push to main branch

## Next Steps

1. 📄 Read [README.md](./README.md) for full documentation
2. 📁 Read [DEVELOPMENT.md](./DEVELOPMENT.md) for coding standards
3. 🚀 Check [FIXES_APPLIED.md](./FIXES_APPLIED.md) to see what was fixed
4. 👩‍💻 Start adding features!

## Troubleshooting

**Q: I see a blank page**
A: Make sure you're visiting http://localhost:3000/dashboard (not just /)

**Q: Sidebar isn't showing on desktop**
A: Check that screen width is 1024px or larger (lg breakpoint)

**Q: Mobile menu not working**
A: Make sure you're on a mobile screen size or use dev tools responsive mode

**Q: Errors in console**
A: Check that all imports use the `@/` alias and file paths exist

## Need Help?

- 📄 Check the **README.md** for detailed documentation
- 📁 Check **DEVELOPMENT.md** for coding conventions
- 🔎 Review existing components in `src/components/dashboard/`
- 📚 [Next.js Docs](https://nextjs.org/docs)
- 📚 [Tailwind CSS Docs](https://tailwindcss.com)

---

**You're all set! Happy coding! 🊀**
