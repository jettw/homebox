# HomeBox Troubleshooting Guide

## Common Issues

### 1. "Failed to fetch" Error on Login Page

**Error Message:**
```
TypeError: Failed to fetch
at ApiClient.request (lib/api/client.ts:68:28)
```

**Cause:** The frontend cannot connect to the backend API.

**Solutions:**

#### Option A: Use the startup script (Easiest)
```bash
./start-dev.sh
```

#### Option B: Manual startup

1. **Start the backend first:**
```bash
cd backend
go run ./app/api
```

Wait until you see:
```
Server is running on 0.0.0.0:7745
```

2. **Then start the frontend in a new terminal:**
```bash
cd frontend-new
pnpm install  # First time only
pnpm dev
```

3. **Check the connection:**
- Backend: http://localhost:7745/api/v1/status
- Frontend: http://localhost:3000

#### Option C: Check what's running

```bash
# Check if backend is running on port 7745
lsof -i :7745

# Check if frontend is running on port 3000
lsof -i :3000
```

If nothing is running, start them with Option A or B.

### 2. Port Already in Use

**Error:** `address already in use`

**Solution:**

```bash
# Kill process on port 7745 (backend)
lsof -ti:7745 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

Or use the stop script:
```bash
./stop-dev.sh
```

### 3. CORS Errors

**Error:** `Access to fetch at 'http://localhost:7745' has been blocked by CORS policy`

**Solution:**

The backend has been updated with proper CORS headers. If you still see this:

1. **Restart the backend** (changes require restart):
```bash
cd backend
go run ./app/api
```

2. **Clear browser cache:**
- Chrome: Cmd+Shift+Delete → Clear browsing data
- Or open in incognito mode

3. **Verify CORS headers are present:**
```bash
curl -I http://localhost:7745/api/v1/status
```

Should show:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### 4. Environment Variables Not Loading

**Error:** API calls going to wrong URL

**Solution:**

1. **Check .env.local exists:**
```bash
cd frontend-new
cat .env.local
```

Should contain:
```
NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1
```

2. **If missing, create it:**
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1" > .env.local
```

3. **Restart the frontend** (env changes require restart):
```bash
pnpm dev
```

### 5. Dependencies Not Installed

**Error:** Module not found errors

**Solution:**

```bash
cd frontend-new
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 6. Go Build Errors

**Error:** `package XXX is not in GOROOT`

**Solution:**

```bash
cd backend
go mod download
go mod tidy
go run ./app/api
```

### 7. Database Issues

**Error:** Database errors on backend startup

**Solution:**

1. **Reset the database:**
```bash
cd backend
rm -rf data/homebox.db
go run ./app/api
```

2. **Check database permissions:**
```bash
ls -la data/
```

### 8. Login Not Working

**Symptoms:** Login button does nothing or returns 401

**Checks:**

1. **Backend is running:**
```bash
curl http://localhost:7745/api/v1/status
```

2. **Check browser console** for errors (F12 → Console tab)

3. **Try demo credentials** (if in demo mode):
   - Email: demo@example.com
   - Password: demo

4. **Register a new account** if registration is enabled

### 8a. Registration "Internal Server Error"

**Error:** 500 Internal Server Error when creating new user

**This was a bug that's now fixed.** The frontend was sending the wrong data format.

**Solution:**

1. **Pull latest code** (contains the fix)
2. **Restart frontend:**
```bash
cd frontend-new
pnpm dev
```

**What was wrong:**
- Frontend sent: `{ user: { name, email, password }, groupName }`
- Backend expected: `{ name, email, password, token }`

**Now fixed:** Registration will:
1. Create the account
2. Automatically log you in
3. Show success message
4. Redirect to dashboard

### 9. "Backend Connection Issue" Warning

**Message:** Yellow warning banner on login page

**This is informational** - it means:
- The backend isn't running yet, OR
- The backend is starting up (wait a few seconds), OR
- The API URL in .env.local is wrong

**Solution:** Start the backend (see #1 above)

### 10. Build Errors in Production

**Error:** Next.js build fails

**Solution:**

```bash
cd frontend-new
rm -rf .next
pnpm build
```

If it still fails, check for TypeScript errors:
```bash
pnpm lint
```

## Quick Health Checks

### Is everything running?

```bash
# Backend health
curl http://localhost:7745/api/v1/status

# Frontend health
curl http://localhost:3000

# Both should return 200 OK
```

### View logs

```bash
# If using startup script
tail -f backend.log frontend.log

# Or in separate terminals
cd backend && go run ./app/api
cd frontend-new && pnpm dev
```

### Reset everything

```bash
# Stop all processes
./stop-dev.sh

# Clean frontend
cd frontend-new
rm -rf .next node_modules
pnpm install

# Clean backend (optional - resets database!)
cd ../backend
rm -rf data/homebox.db

# Start fresh
cd ..
./start-dev.sh
```

## Still Having Issues?

1. **Check versions:**
```bash
node --version   # Should be 20+
go version       # Should be 1.21+
pnpm --version   # Should be 8+
```

2. **Check the error in browser DevTools:**
- F12 → Console tab
- F12 → Network tab (look for failed requests)

3. **Enable debug logging:**

Backend:
```bash
HBOX_DEBUG=true HBOX_LOGGER_LEVEL=-1 go run ./app/api
```

4. **Test the API directly:**
```bash
# Get status
curl http://localhost:7745/api/v1/status

# Try login (replace with your credentials)
curl -X POST http://localhost:7745/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo@example.com","password":"demo"}'
```

## Getting Help

If none of these solve your issue:

1. Check existing issues: https://github.com/sysadminsmedia/homebox/issues
2. Join Discord: https://discord.gg/aY4DCkpNA9
3. Check docs: https://homebox.software/en/

When reporting issues, include:
- Error message (full text)
- Browser console output (F12 → Console)
- Backend logs
- Your environment (OS, Node version, Go version)

