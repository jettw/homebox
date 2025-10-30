#!/bin/bash

# List users in HomeBox database

DB_FILE="backend/.data/homebox.db"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database not found: $DB_FILE"
    echo "   Run the backend first to create the database."
    exit 1
fi

echo "📋 Registered Users:"
echo ""

sqlite3 "$DB_FILE" << EOF
.mode column
.headers on
SELECT 
    email as Email,
    name as Name,
    created_at as "Registered At"
FROM users
ORDER BY created_at DESC;
EOF

echo ""
echo "💡 To login with any of these accounts, use the email and password you registered with."
echo "💡 To reset the database: ./reset-db.sh"

