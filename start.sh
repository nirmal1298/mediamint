#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p)
    echo "Services stopped."
}

# Trap SIGINT and SIGTERM
trap cleanup SIGINT SIGTERM

echo "Starting IssueHub..."

# 1. Start Database
echo "[1/3] Starting Database (Docker)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "Error starting Docker. Is Docker Desktop running?"
    exit 1
fi
echo "Database started."

# 2. Start Backend
echo "[2/3] Starting Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    alembic upgrade head
else
    source venv/bin/activate
fi

# Run uvicorn in background
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..
echo "Backend running on http://localhost:8000 (PID: $BACKEND_PID)"

# 3. Start Frontend
echo "[3/3] Starting Frontend..."
cd frontend
# Run npm dev in background
npm run dev -- --host &
FRONTEND_PID=$!
cd ..
echo "Frontend running on http://localhost:5173 (PID: $FRONTEND_PID)"

echo "------------------------------------------------"
echo "IssueHub is running!"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000/docs"
echo "Press Ctrl+C to stop everything."
echo "------------------------------------------------"

# Wait for background processes
wait
