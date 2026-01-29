# IssueHub — Lightweight Bug Tracker

IssueHub is a minimal but powerful bug tracking application designed for teams to manage projects, file issues, and track progress efficiently. Built with modern technologies, it features a robust FastAPI backend and a responsive React frontend with a clean UI.

## Tech Stack

*   **Backend:** Python 3, FastAPI, SQLAlchemy (ORM), Alembic (Migrations), Pydantic
*   **Database:** PostgreSQL 15 (Dockerized)
*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Shadcn UI
*   **Authentication:** JWT (JSON Web Tokens) with Password Hashing (Bcrypt)

## Features

*   **User Management:** Signup, Login, Profile.
*   **Projects:** Create and list projects.
*   **Issues:** Create, view, filter (by status), and track issues.
*   **Comments:** Discuss issues with threaded comments.
*   **Security:** Protected routes ensuring data privacy.

## Prerequisites

*   Docker & Docker Compose (for Database)
*   Python 3.10+
*   Node.js 18+ & npm

## Quick Start

You can start the entire application (Database, Backend, and Frontend) with a single command:

```bash
./start.sh
```

## Setup Instructions

### 1. Database Setup (Docker)

Start the PostgreSQL database:

```bash
docker-compose up -d
```

This starts a Postgres instance on port `5432` with user `postgres`, password `postgres`, and db `issuehub`.

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run database migrations:

```bash
alembic upgrade head
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`. API Docs (Swagger UI) at `http://localhost:8000/docs`.

**Running Tests:**

```bash
PYTHONPATH=. pytest
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

## Architecture & Choices

*   **Monorepo Structure:** `backend/` and `frontend/` kept together for easier reference.
*   **FastAPI:** Chosen for speed, automatic documentation, and type safety.
*   **Shadcn UI:** Used for accessible, high-quality React components without shipping a heavy library.
*   **JWT Auth:** Stateless authentication for scalability.

## Future Improvements

*   Search functionality for issues.
*   Assignee filtering and management.
*   Email notifications.
*   Deploy scripts (Dockerfiles for app).
