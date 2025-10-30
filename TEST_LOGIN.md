# Test Login Flow

## What To Do

1. **Open Browser DevTools** 
   - Press `F12` or right-click → Inspect
   - Go to **Console** tab

2. **Go to Login Page**
   - http://localhost:3000/login

3. **Clear Storage** (important!)
   - In DevTools: Application → Storage → Clear site data
   - OR just delete localStorage `auth_token`

4. **Try to Login**
   - Enter credentials
   - Click "Login"

5. **Watch Console**

You should see this sequence:
```
🎯 Form submitted {isRegister: false, email: "..."}
📝 Calling login...
🔐 Attempting login...
✅ Token saved: xxx...
🔐 Sending Authorization header: Bearer xxx...
✅ Login successful, fetching user...
🔐 Sending Authorization header: Bearer xxx...
✅ User fetched
📝 Login form submitted
📝 Login result: true
🚀 Redirecting to dashboard...
```

## If You See Errors

### Error: "Login failed"
- Check backend is running: http://localhost:7745/api/v1/status
- Check credentials are correct
- Check backend logs: `tail -f backend.log`

### Console shows success but no redirect
- Try: `window.location.href = '/dashboard'` in console
- If that works, there's a navigation issue
- If that doesn't work, check dashboard page

### Token errors
- Run: `window.debugAuth()` in console
- Should show token info
- Check if token is expired

## Manual Test

In browser console, try:
```javascript
// Test login manually
const response = await fetch('http://localhost:7745/api/v1/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'jett.whitaker@item.com',
    password: 'YOUR_PASSWORD_HERE'
  })
});
const data = await response.json();
console.log(data);

// Save token
localStorage.setItem('auth_token', data.token.replace('Bearer ', ''));

// Test /users/self
const token = localStorage.getItem('auth_token');
const userResponse = await fetch('http://localhost:7745/api/v1/users/self', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await userResponse.json();
console.log(user);

// Try redirect
window.location.href = '/dashboard';
```

## Quick Fixes

### 1. Clear everything and restart
```bash
./stop-dev.sh
rm backend/.data/homebox.db  # WARNING: Deletes all data!
./start-dev.sh
```

### 2. Just clear browser
- Clear localStorage
- Clear cookies
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### 3. Check dashboard exists
Go directly to: http://localhost:3000/dashboard

If you get redirected back to login, authentication is working!
If you see "Loading..." forever, dashboard has an issue.
If you see the dashboard, navigation is the problem.

## Expected Behavior

✅ Login → Token saved → User fetched → Redirect to dashboard → See stats and items

## Current Status

Based on logs:
- ✅ Backend is running
- ✅ Login endpoint works (200 OK)
- ✅ /users/self works (200 OK)
- ✅ Token is being saved
- ❓ Redirect might not be triggering

Try the manual test above to isolate the issue!

