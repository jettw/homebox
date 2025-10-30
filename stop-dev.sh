#!/bin/bash

# HomeBox Development Stop Script

echo "🛑 Stopping HomeBox Development Environment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
    rm backend.pid
else
    # Try to kill by port
    BACKEND_PID=$(lsof -ti:7745)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped (PID: $BACKEND_PID)${NC}"
    fi
fi

# Stop frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    fi
    rm frontend.pid
else
    # Try to kill by port
    FRONTEND_PID=$(lsof -ti:3000)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped (PID: $FRONTEND_PID)${NC}"
    fi
fi

echo ""
echo -e "${GREEN}✓ HomeBox stopped${NC}"

