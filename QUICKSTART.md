# HomeBox Quick Start Guide

## Prerequisites

- **Node.js** 20+ and **pnpm** (for frontend)
- **Go** 1.21+ (for backend)
- **Docker** and **Docker Compose** (optional, for containerized setup)

## Option 1: Local Development (Recommended)

### 1. Start the Backend

```bash
cd backend
go run ./app/api
```

The backend API will be available at `http://localhost:7745`

### 2. Start the Frontend

Open a new terminal:

```bash
cd frontend-new
pnpm install
cp .env.example .env.local
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### 3. Access the Application

Navigate to `http://localhost:3000` in your browser.

## Option 2: Docker Compose

```bash
docker-compose up --build
```

This will start both services:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:7745`

## Default Credentials

If the application is in demo mode, use:
- **Email**: demo@example.com
- **Password**: demo

Otherwise, create a new account using the registration form.

## Project Structure

```
homebox/
├── backend/              # Go API server
│   └── app/api/         # Main API application
├── frontend-new/        # Next.js frontend (NEW)
│   ├── app/            # Pages and routes
│   ├── components/     # React components
│   └── lib/           # Utilities and API client
└── docker-compose.yml  # Docker configuration
```

## Key Features

- ✅ **Dashboard**: Overview of your inventory
- ✅ **Items**: Manage your things
- ✅ **Locations**: Organize storage spaces
- ✅ **Labels**: Tag and categorize
- ✅ **Profile**: User account management

## Development Commands

### Frontend

```bash
cd frontend-new
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
```

### Backend

```bash
cd backend
go run ./app/api              # Run development server
go build ./app/api            # Build binary
go test ./...                 # Run tests
```

## API Documentation

Once the backend is running, visit:
`http://localhost:7745/swagger/`

## Environment Configuration

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1
```

### Backend

The backend uses environment variables or a config file. Key variables:

```bash
HBOX_WEB_HOST=0.0.0.0
HBOX_WEB_PORT=7745
HBOX_DEBUG=true
HBOX_LOGGER_LEVEL=-1
```

## Troubleshooting

### Port Already in Use

**Frontend (3000)**:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Backend (7745)**:
```bash
# Kill the process using port 7745
lsof -ti:7745 | xargs kill -9
```

### CORS Errors

The backend has been configured with CORS headers. If you still experience issues:
1. Check that the backend is running
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Clear browser cache and reload

### Database Issues

The backend uses SQLite by default. Database file is stored in:
```
backend/data/homebox.db
```

To reset the database, delete this file and restart the backend.

## Next Steps

1. **Create your first item**: Click "Items" → "Add Item"
2. **Organize with locations**: Set up your storage structure
3. **Use labels**: Tag items for easy filtering
4. **Explore the dashboard**: View statistics and recent items

## Support

- **Documentation**: https://homebox.software/en/
- **GitHub**: https://github.com/sysadminsmedia/homebox
- **Discord**: https://discord.gg/aY4DCkpNA9

## Stack Overview

- **Backend**: Go with Chi router, Ent ORM
- **Frontend**: Next.js 16, React 19, TypeScript
- **UI**: shadcn/ui components, Tailwind CSS 4
- **Icons**: Tabler Icons React
- **Database**: SQLite (default) or PostgreSQL

