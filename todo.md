# IssueHub Development Checklist

## Phase 1: Project Setup & Infrastructure
- [x] Initialize Git repository
- [x] Set up Project Structure (Monorepo: `backend/`, `frontend/`)
- [x] **Backend**: Setup FastAPI, Poetry, and Dependencies
- [x] **Database**: Setup PostgreSQL (via Docker) and Alembic for migrations
- [x] **Frontend**: Setup React + Vite + TypeScript + TailwindCSS

## Phase 2: Backend Development
- [x] **Models**: Define SQLAlchemy models (User, Project, ProjectMember, Issue, Comment)
- [x] **Auth**: Implement Signup, Login (JWT), and `Me` endpoints
- [x] **Projects**: Implement CRUD API for Projects and Members
- [x] **Issues**: Implement CRUD API for Issues (with filtering/sorting)
- [x] **Comments**: Implement CRUD API for Comments
- [x] **Testing**: Write basic integration tests for core flows

## Phase 3: Frontend Development
- [x] **Infrastructure**: Setup Axios/Query, Auth Context, and Protected Routes
- [x] **Auth UI**: Create Login and Signup pages
- [x] **Dashboard**: Create Dashboard to list User's Projects
- [x] **Project View**: Create Project details page with Issue List (Search & Filter)
- [x] **Issue View**: Create Issue details page (Info + Comments thread)
- [x] **Create/Edit**: Implement forms for creating/editing Projects and Issues

## Phase 4: Polish & Documentation
- [x] **Styling**: Ensure responsive and clean UI (using Shadcn/UI or similar)
- [x] **Refinement**: Handle error states, loading spinners, and form validation
- [x] **Docs**: Update README.md with setup and run instructions
