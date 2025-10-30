#!/bin/bash

# HomeBox Database Reset Script

echo "⚠️  This will DELETE ALL DATA in your HomeBox database!"
echo ""
read -p "Are you sure? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🗑️  Deleting database..."

# Stop the backend if running
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "Stopping backend..."
        kill $BACKEND_PID
        sleep 2
        rm backend.pid
    fi
else
    # Try to kill by port
    BACKEND_PID=$(lsof -ti:7745)
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend..."
        kill $BACKEND_PID
        sleep 2
    fi
fi

# Remove database file
if [ -f backend/.data/homebox.db ]; then
    rm backend/.data/homebox.db
    echo "✓ Database deleted"
else
    echo "ℹ️  No database found"
fi

echo ""
echo "✓ Reset complete!"
echo ""
echo "To start fresh:"
echo "  ./start-dev.sh"

