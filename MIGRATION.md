# HomeBox Frontend Migration Guide

## Overview

The HomeBox frontend has been migrated from Nuxt 3 (Vue) to Next.js 16 (React) with shadcn/ui components.

## What's New

### Technology Stack
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** components
- **@tabler/icons-react** for icons

### Features Implemented

1. **Authentication System**
   - Login/Register forms with toggle
   - Demo mode detection and auto-fill
   - Remember me functionality
   - Protected routes via middleware

2. **Dashboard**
   - Statistics overview (items, locations, labels, total value)
   - Recent items table with search
   - Real-time data from API

3. **Items Management**
   - Browse all items in grid layout
   - Search functionality
   - View item details (name, location, quantity, price, labels)

4. **Locations Management**
   - View all storage locations
   - Parent-child relationships

5. **Labels Management**
   - Browse and manage labels
   - Visual tag representation

6. **Profile Page**
   - View user information
   - Account management
   - Logout functionality

### Backend Changes

Added CORS support in `backend/app/api/main.go` to allow frontend-backend communication:
```go
middleware.SetHeader("Access-Control-Allow-Origin", "*"),
middleware.SetHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS"),
middleware.SetHeader("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, Authorization"),
```

### Docker Setup

Updated `docker-compose.yml` to run both backend and frontend:
```yaml
services:
  backend:
    ports:
      - 7745:7745
    
  frontend:
    build: ./frontend-new
    ports:
      - 3000:3000
    depends_on:
      - backend
```

## Project Structure

```
homebox/
├── backend/              # Go API (unchanged)
├── frontend/            # Old Nuxt 3 frontend (keep for reference)
├── frontend-new/        # New Next.js frontend
│   ├── app/            # Next.js pages
│   │   ├── dashboard/
│   │   ├── items/
│   │   ├── locations/
│   │   ├── labels/
│   │   ├── profile/
│   │   └── login/
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── ...
│   ├── lib/           # Utilities
│   │   └── api/       # API client
│   └── Dockerfile
└── docker-compose.yml
```

## Running the Application

### Development

1. **Backend** (terminal 1):
```bash
cd backend
go run ./app/api
```

2. **Frontend** (terminal 2):
```bash
cd frontend-new
pnpm install
pnpm dev
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:7745

### Docker

```bash
docker-compose up --build
```

Access at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:7745

## API Integration

The new frontend uses a custom API client in `frontend-new/lib/api/`:

### Authentication
```typescript
import { useAuth } from "@/lib/api/hooks";

const { user, login, logout, loading, error } = useAuth();

// Login
await login("user@example.com", "password");

// Logout
await logout();
```

### Data Fetching
```typescript
import { itemsApi, locationsApi, labelsApi } from "@/lib/api/items";

// Get items
const { items, total } = await itemsApi.getAll({ 
  page: 1, 
  pageSize: 20,
  q: "search term"
});

// Get locations
const locations = await locationsApi.getAll();

// Get labels
const labels = await labelsApi.getAll();
```

## Key Differences from Old Frontend

| Feature | Old (Nuxt/Vue) | New (Next.js/React) |
|---------|---------------|---------------------|
| Framework | Nuxt 3 | Next.js 16 |
| Language | Vue 3 | React 19 |
| UI Library | Custom + DaisyUI | shadcn/ui |
| Routing | Nuxt Pages | Next.js App Router |
| State Management | Pinia | React Context |
| API Calls | useAsyncData | Custom hooks |
| Icons | @iconify | @tabler/icons-react |
| Styling | Tailwind CSS 3 | Tailwind CSS 4 |

## Environment Variables

Create `.env.local` in `frontend-new/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1
```

For production, update to your backend URL.

## Next Steps

### Remaining Features to Implement

1. **Item Details Page** (`/items/[id]`)
   - View full item details
   - Edit item
   - Add/remove attachments
   - Maintenance log

2. **Create/Edit Forms**
   - Item creation
   - Location creation
   - Label creation

3. **Maintenance Management**
   - View maintenance entries
   - Create new entries
   - Schedule maintenance

4. **Tools/Settings Pages**
   - Group settings
   - Export/Import
   - Bulk actions

5. **Reports**
   - Bill of materials
   - Label generator

6. **Advanced Features**
   - Search with filters
   - QR code generation
   - Barcode scanning
   - File uploads

## shadcn/ui Components Used

- Button
- Input
- Card
- Table
- Badge
- Sidebar
- Dropdown Menu
- Avatar
- Checkbox
- Label
- Separator
- Tooltip
- Tabs
- Skeleton (for loading states)

To add more components:
```bash
npx shadcn@latest add [component-name]
```

## Development Tips

1. **Adding New Pages**: Create files in `app/[page-name]/page.tsx`
2. **API Calls**: Use the hooks from `lib/api/hooks.ts` or functions from `lib/api/items.ts`
3. **Protected Routes**: Pages automatically redirect to login if not authenticated
4. **Styling**: Use Tailwind classes, all shadcn components are pre-styled
5. **Icons**: Import from `@tabler/icons-react`

## Troubleshooting

### CORS Errors
Ensure the backend has CORS headers (already added in this setup).

### API Connection Failed
- Check backend is running on port 7745
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check network tab in browser DevTools

### Authentication Issues
- Clear browser localStorage
- Check token is being sent in Authorization header
- Verify backend `/api/v1/status` endpoint is accessible

## Migration Checklist

- [x] Basic authentication (login/register)
- [x] Dashboard with stats
- [x] Items list view
- [x] Locations list
- [x] Labels list
- [x] Profile page
- [x] Sidebar navigation
- [x] Docker setup
- [x] CORS configuration
- [ ] Item details page
- [ ] Create/Edit forms
- [ ] File uploads
- [ ] Maintenance management
- [ ] Reports
- [ ] Settings page
- [ ] Search filters
- [ ] QR codes
- [ ] Responsive design improvements

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)
- [HomeBox Backend API](http://localhost:7745/swagger/)

