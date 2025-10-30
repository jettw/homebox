#!/bin/bash

# HomeBox Development Startup Script

echo "🏠 Starting HomeBox Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is already running
if lsof -Pi :7745 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend is already running on port 7745${NC}"
else
    echo -e "${BLUE}🚀 Starting Go Backend...${NC}"
    cd backend
    go run ./app/api > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../backend.pid
    cd ..
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    echo "   Logs: backend.log"
fi

# Wait a moment for backend to start
sleep 2

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend is already running on port 3000${NC}"
else
    echo -e "${BLUE}🚀 Starting Next.js Frontend...${NC}"
    cd frontend-new
    
    # Check if .env.local exists
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}Creating .env.local...${NC}"
        cp .env.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:7745/api/v1" > .env.local
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        pnpm install
    fi
    
    pnpm dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../frontend.pid
    cd ..
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
    echo "   Logs: frontend.log"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ HomeBox is running!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  🔌 Backend:   ${BLUE}http://localhost:7745${NC}"
echo -e "  📚 API Docs:  ${BLUE}http://localhost:7745/swagger/${NC}"
echo ""
echo -e "${YELLOW}To stop:${NC} ./stop-dev.sh"
echo -e "${YELLOW}To view logs:${NC} tail -f backend.log frontend.log"
echo ""

