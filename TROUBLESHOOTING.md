# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. CSS Error: "Unknown word <<<<<<<"

**Problem:** You see this error in the browser console:
```
CssSyntaxError: Unknown word <<<<<<<
```

**Cause:** Git merge conflict markers left in globals.css file

**Solution:**
```bash
# Clear the file and rebuild
rm -rf .next
npm run dev
```

**Or manually fix:**
1. Open `src/app/globals.css`
2. Look for `<<<<<<<` or `=======` or `>>>>>>>`
3. Delete those conflict markers
4. Keep the code you want
5. Restart dev server

---

### 2. CSS Error: "Unknown word /"

**Problem:** Similar CSS syntax error in globals.css

**Cause:** Incomplete merge conflict cleanup

**Solution:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run dev
```

---

### 3. "Unsupported metadata viewport" Warning

**Problem:** Browser console shows:
```
Unsupported metadata viewport is configured in metadata export
Please move it to viewport export instead
```

**Cause:** Metadata object in page.js exports metadata with viewport

**Solution:** Remove this from page.js:
```javascript
// ❌ WRONG - Remove this:
export const metadata = {
  viewport: "..."
}

// ✅ CORRECT - Just use client component:
"use client"
```

**Status:** ✅ Fixed in all pages

---

### 4. "DialogContent requires DialogTitle" Warning

**Problem:** Browser console shows accessibility warning

**Cause:** Modal component missing accessible title

**Solution:** Our modals already have titles, this is just a warning. Safe to ignore.

---

### 5. Port 3000 Already in Use

**Problem:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution 1:** Kill the process on port 3000
```bash
# On Windows (PowerShell as Admin):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

**Solution 2:** Use different port
```bash
npm run dev -- -p 3001
# Visit http://localhost:3001
```

---

### 6. "Module not found" Error

**Problem:**
```
Module not found: Can't resolve '@/components/ui/button'
```

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### 7. Login Not Working

**Problem:** Login page doesn't redirect after clicking Sign In

**Cause:** localStorage not available or auth context issue

**Solution:**
1. Check browser console for errors (F12)
2. Make sure cookies/storage enabled in browser
3. Try clearing browser cache (Ctrl+Shift+Delete)
4. Try demo credentials:
   - Email: `admin@superadmin_dashbaord.com`
   - Password: `password123`

---

### 8. Modals Not Opening

**Problem:** Add/Edit buttons clicked but modals don't appear

**Solution:**
1. Check JavaScript is enabled
2. Open browser console (F12) for errors
3. Look for React errors in console
4. Try hard refresh (Ctrl+Shift+R)

---

### 9. Sidebar Not Collapsing

**Problem:** Sidebar menu items don't expand/collapse

**Solution:**
1. Check console for JavaScript errors
2. Make sure you're clicking on menu items (not submenu items)
3. Try hard refresh (Ctrl+Shift+R)

---

### 10. Styles Not Applying (Tailwind Issues)

**Problem:** Page looks unstyled or colors are wrong

**Solution:**
```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run dev

# Or restart dev server
# Ctrl+C to stop
# npm run dev to start
```

---

### 11. "Cannot find module 'sonner'"

**Problem:**
```
Module not found: Can't resolve 'sonner'
```

**Solution:**
```bash
# Install missing package
npm install sonner
npm run dev
```

---

### 12. Toast Notifications Not Showing

**Problem:** Actions complete but no toast appears

**Cause:** Sonner provider might be missing

**Solution:** Check `src/app/layout.js` has:
```javascript
import { Toaster } from "sonner"

// Inside JSX:
<Toaster />
```

---

### 13. Fast Refresh Rebuilding Continuously

**Problem:** Console shows `[Fast Refresh] rebuilding` repeatedly

**Cause:** File changes being detected constantly

**Solution:**
1. Check you didn't save a file with syntax error
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Check for git merge conflicts in files you edited

---

### 14. CRUD Operations Not Persisting

**Problem:** Add/Edit/Delete work in UI but data resets on refresh

**Expected:** This is correct! Data is stored in React state only.

**To persist data:**
1. Connect to a backend API
2. Use localStorage (optional, for demo)
3. Use a database (recommended)

---

### 15. Responsive Design Issues

**Problem:** Layout breaks on mobile or tablet

**Solution:**
1. Open DevTools (F12)
2. Click device toolbar icon
3. Check layout at different sizes
4. Report specific breakpoint where it breaks

---

## Prevention Checklist ✅

- [ ] Always run `npm install` after pulling new changes
- [ ] Don't manually edit node_modules (reinstall instead)
- [ ] Clear `.next` folder if styles seem broken
- [ ] Use `npm run dev` (not `node` or other commands)
- [ ] Keep browser DevTools open while developing
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Check console for warnings (F12 → Console tab)
- [ ] Use `Ctrl+Shift+R` (hard refresh) not just F5

---

## Getting Help

### Check These First:
1. **Browser Console** (F12 → Console)
2. **Terminal Output** (where you ran `npm run dev`)
3. **This Guide** (you're reading it!)
4. **FEATURES.md** - Feature overview
5. **INSTALLATION.md** - Setup steps

### Debug Tips:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Screenshot the error
5. Check stack trace for file/line

---

## Quick Restart Steps

If things are really broken:

```bash
# 1. Stop dev server
Ctrl+C

# 2. Clean everything
rm -rf .next node_modules package-lock.json

# 3. Reinstall
npm install

# 4. Start fresh
npm run dev

# 5. Hard refresh browser
Ctrl+Shift+R
```

---

## Performance Issues

### App is Slow
1. Check browser console for errors
2. Check DevTools Performance tab
3. Reduce number of items in tables/lists
4. Check browser extensions aren't interfering

### High Memory Usage
1. Close unnecessary browser tabs
2. Restart dev server
3. Check for memory leaks in console

---

## Still Having Issues?

1. **Reset everything:**
   ```bash
   git status  # Check if files modified
   git checkout .  # Revert all changes
   rm -rf .next node_modules
   npm install
   npm run dev
   ```

2. **Check git status:**
   ```bash
   git log --oneline  # See recent commits
   git status  # See what changed
   ```

3. **Nuclear option (use with caution):**
   ```bash
   git reset --hard HEAD
   git clean -fd
   rm -rf .next
   npm install
   npm run dev
   ```

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module` | Missing dependency | `npm install` |
| `EADDRINUSE` | Port in use | Use different port |
| `CssSyntaxError` | CSS file broken | Clear `.next` folder |
| `Unexpected token` | Syntax error in JS | Check file for typos |
| `Module not found` | Import path wrong | Check file path |
| `localStorage not available` | In Node/SSR context | Check if code is in `"use client"` |

---

**Last Updated:** December 13, 2025

**Need help?** Check the browser console first! 99% of issues show up there. 🔍
