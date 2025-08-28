#!/bin/bash

echo "🚀 Starting clone_erp AI IT SOLAR"

# Kill processes on correct ports
lsof -ti:4000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

echo "🔧 Backend starting on port 4000..."
cd backend
npm run dev &
BACKEND_PID=$!

echo "🎨 Frontend starting on port 5173..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

sleep 3
echo ""
echo "✅ Servers running:"
echo "   🔧 Backend:  http://localhost:4000"
echo "   🎨 Frontend: http://localhost:5173"
echo ""
echo "🧪 Test backend: curl http://localhost:4000/health"
echo "🛑 Press Ctrl+C to stop"

trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
