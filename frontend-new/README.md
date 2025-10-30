# HomeBox Next.js Frontend

Modern Next.js frontend for HomeBox using shadcn/ui components.

## Features

- **Authentication**: Login/Register with demo mode support
- **Dashboard**: Overview of inventory statistics
- **Items Management**: Browse, search, and manage inventory items
- **Locations**: Organize storage locations
- **Labels**: Categorize items with labels
- **Profile**: View and manage user account

## Tech Stack

- **Next.js 16** with App Router
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** components
- **@tabler/icons-react** for icons

## Getting Started

### Development

1. Install dependencies:
```bash
pnpm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1
```

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### With Docker

Build and run with docker-compose:
```bash
docker-compose up --build
```

This will start both the backend (port 7745) and frontend (port 3000).

## Project Structure

```
frontend-new/
├── app/                   # Next.js app directory
│   ├── dashboard/        # Dashboard page
│   ├── items/           # Items listing
│   ├── locations/       # Locations listing
│   ├── labels/          # Labels listing
│   ├── profile/         # User profile
│   └── login/           # Login/Register page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── app-sidebar.tsx # Main sidebar navigation
│   ├── login-form.tsx  # Login form component
│   └── ...
├── lib/                # Utilities and API client
│   ├── api/           # API client and hooks
│   └── utils.ts       # Utility functions
└── public/            # Static assets
```

## API Integration

The frontend connects to the HomeBox Go backend via a REST API. The API client is located in `lib/api/`:

- `client.ts`: Main API client with authentication
- `hooks.ts`: React hooks for auth (useAuth)
- `items.ts`: API functions for items, locations, labels

### Using the API

```typescript
import { useAuth } from "@/lib/api/hooks";
import { itemsApi } from "@/lib/api/items";

// In a component
const { user, login, logout } = useAuth();

// Fetch items
const items = await itemsApi.getAll({ page: 1, pageSize: 20 });
```

## Available Pages

- `/` - Home (redirects to dashboard or login)
- `/login` - Login/Register page
- `/dashboard` - Main dashboard with statistics
- `/items` - Items list view
- `/locations` - Locations list
- `/labels` - Labels list
- `/profile` - User profile

## Development Notes

- The frontend uses client-side rendering for most components
- Authentication state is managed globally via AuthContext
- API calls are wrapped in React hooks for easy use
- All components use TypeScript for type safety

## Building for Production

```bash
pnpm build
pnpm start
```

Or with Docker:
```bash
docker build -t homebox-frontend -f Dockerfile .
docker run -p 3000:3000 homebox-frontend
```
