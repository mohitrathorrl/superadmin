# Development Guide 📖

This document outlines best practices, coding standards, and development workflows for the superadmin_dashbaord Fintech Dashboard.

## 🎯 Coding Standards

### JavaScript/JSX

#### File Naming
```
✅ GOOD:
- page.js (Next.js pages)
- layout.js (Next.js layouts)
- Sidebar.jsx (React components, PascalCase)
- utils.js (utilities, lowercase)
- use-auth.js (hooks, kebab-case)

❌ BAD:
- Sidebar.js (ambiguous with pages)
- useSidebar.js (hooks should be kebab-case)
- UTILS.js (all caps)
```

#### Component Structure

```jsx
"use client" // Add if using client hooks

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Component with proper exports
export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <div className="surface">
      {/* Content */}
    </div>
  )
}

// If you have a subcomponent
export function SidebarItem() {
  return <div>Item</div>
}
```

#### Props and Destructuring

```jsx
// ✅ Destructure props in function params
export function Card({ title, description, children }) {
  return <div>{/* Component */}</div>
}

// ✅ Use PropTypes or TypeScript (optional)
// For now, use JSDoc for documentation
/**
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.children - Card content
 */
export function Card({ title, children }) {
  return <div>{/* Component */}</div>
}
```

### Tailwind CSS Classes

#### Class Organization

Follow this order in className attributes:
1. Layout (`flex`, `grid`, `absolute`)
2. Display (`hidden`, `block`)
3. Sizing (`w-full`, `h-10`)
4. Spacing (`p-4`, `m-2`)
5. Typography (`text-sm`, `font-bold`)
6. Colors (`bg-white`, `text-zinc-900`)
7. Borders & Shadows (`border`, `shadow-md`)
8. Effects & Transforms (`hover:`, `transition`)

```jsx
// ✅ Good order
<div className="flex items-center gap-4 rounded-lg border bg-white p-4 text-sm font-medium shadow-md hover:shadow-lg">

// ❌ Mixed order (avoid)
<div className="text-sm p-4 flex items-center gap-4 bg-white hover:shadow-lg shadow-md border font-medium rounded-lg">
```

#### Responsive Classes

```jsx
// ✅ Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* 1 column by default, 2 on small screens, 4 on large */}
</div>

// ✅ Stacked on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">

// ✅ Hidden on mobile, visible on desktop
<aside className="hidden lg:block w-64">
```

### Component Patterns

#### Surface/Card Components

Use the `.surface` utility class for consistent styling:

```jsx
// ✅ Good
<div className="surface p-6">
  <h2 className="font-bold">Title</h2>
  <p>Content</p>
</div>

// ❌ Avoid repeating border/shadow styles
<div className="rounded-lg border bg-white shadow-sm p-6">
```

#### Buttons

Use button components from `@/components/ui/button` or CSS classes:

```jsx
import { Button } from "@/components/ui/button"

// ✅ Using component
<Button className="btn-primary">Click me</Button>
<Button variant="outline">Secondary</Button>

// ✅ Using CSS class
<button className="btn-primary">Click me</button>
<button className="btn-secondary">Secondary</button>

// ❌ Avoid mixing unstyled buttons
<button>Click me</button>
```

#### Forms

```jsx
// ✅ Proper form structure
<div className="space-y-4">
  <div>
    <label className="text-sm font-medium">Email</label>
    <input
      type="email"
      className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      placeholder="you@example.com"
    />
  </div>
</div>
```

## 📁 Project Organization

### When to Create New Directories

1. **New Route/Page**: Create in `src/app/dashboard/[feature-name]/`
2. **Shared Component**: Create in `src/components/[category]/`
3. **Utility Function**: Add to `src/lib/` or `src/hooks/`
4. **Styles**: Keep in global CSS unless component-scoped

### Import Aliases

Always use path aliases for clean imports:

```jsx
// ✅ Good
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/dashboard/sidebar"

// ❌ Avoid relative paths
import { Button } from "../../../../components/ui/button"
import { cn } from "../../lib/utils"
```

## 🎨 Design System Usage

### Colors

Available CSS variables in `globals.css`:

```jsx
// Text colors
<p className="text-zinc-600 muted">Muted text</p>
<p className="text-zinc-900">Primary text</p>

// Background colors
<div className="bg-white">Surface</div>
<div className="bg-zinc-50">Subtle background</div>

// Status colors
<span className="badge-success">Success</span>
<span className="badge-error">Error</span>
<span className="badge-warning">Warning</span>
```

### Spacing

Use Tailwind's space scale:

```jsx
// Margin
<div className="m-4">16px margin all sides</div>
<div className="mx-4">16px margin left & right</div>
<div className="mb-8">32px margin bottom</div>

// Padding
<div className="p-6">24px padding</div>
<div className="px-4 py-2">16px h, 8px v padding</div>

// Gap (flexbox)
<div className="flex gap-4">Item 1</div> {/* 16px gap */}
```

## ✅ Git Workflow

### Branch Naming

```
feature/add-export-button
fix/sidebar-navigation-bug
refactor/optimize-transactions-table
docs/update-readme
style/fix-button-spacing
```

### Commit Messages

```
feat: add transaction export button
fix: fix sidebar active link highlighting
refactor: extract form validation logic
docs: update component documentation
style: fix button spacing inconsistency
perf: optimize dashboard stats rendering
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Testing
How to test these changes?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] I've tested this locally
- [ ] No new warnings in console
- [ ] Responsive on mobile/tablet/desktop
```

## 🚀 Performance Tips

### Image Optimization

Use Next.js Image component:

```jsx
import Image from "next/image"

// ✅ Good
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority // For above-the-fold images
/>

// ❌ Avoid native img tag
<img src="/logo.png" alt="Logo" />
```

### Component Code Splitting

```jsx
// ✅ Mark interactive components as client-side
"use client"
import { useState } from "react"

export function InteractiveComponent() {
  const [state, setState] = useState(false)
  return <div>{/* ... */}</div>
}

// ✅ Server components fetch data
export default async function ServerPage() {
  const data = await fetch(...)
  return <div>{/* ... */}</div>
}
```

### CSS Best Practices

Use Tailwind utilities instead of custom CSS:

```jsx
// ✅ Use Tailwind
<div className="rounded-lg shadow-md">

// ❌ Avoid custom CSS
<style>
  .rounded-lg {
    border-radius: 8px;
  }
</style>
```

## 🔍 Testing Checklist

Before committing:

- [ ] Component renders without errors
- [ ] No console warnings or errors
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1024px)
- [ ] Links and buttons work
- [ ] Forms accept input
- [ ] Keyboard navigation works
- [ ] Focus states visible

## 📋 Code Review Checklist

When reviewing PRs:

- [ ] Follows naming conventions
- [ ] Proper component structure
- [ ] Consistent Tailwind class order
- [ ] No hardcoded colors (use CSS variables)
- [ ] Responsive design implemented
- [ ] Accessibility considered
- [ ] No console warnings
- [ ] Performance implications reviewed
- [ ] Tests pass (when applicable)

## 🆘 Debugging

### Common Issues

**Issue**: Tailwind classes not applying
```bash
# Solution: Rebuild Tailwind
rm -rf .next
npm run dev
```

**Issue**: Component not importing correctly
```jsx
// Check 1: Verify export exists
// In component file:
export function ComponentName() {} // ✅

// Check 2: Verify import path
import { ComponentName } from "@/components/path" // ✅

// Check 3: Named vs default export
// If using named export:
import { ComponentName } from "..."

// If using default export:
import ComponentName from "..."
```

**Issue**: Styles not responsive
```jsx
// Use mobile-first approach
<div className="text-sm sm:text-base lg:text-lg">
  {/* Starts small, grows on larger screens */}
</div>
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Best Practices](https://react.dev/learn)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🎓 Learning Path

1. Read this document
2. Review existing components in `src/components/dashboard/`
3. Study the design system in `src/app/globals.css`
4. Create a simple component (button variant or card)
5. Create a new dashboard page
6. Submit PR for review

---

**Questions?** Review the README.md or check existing code patterns.
