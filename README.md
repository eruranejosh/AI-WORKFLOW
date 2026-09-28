# AI Workflow Builder

A visual AI workflow system where each node represents an AI decision that returns YES or NO.

## Technologies

- Next.js
- React Flow
- Inngest
- FastAPI
- OpenRouter
- OpenAI SDK
- Shadcn

## Features

- Visual workflow editor
- Add and connect AI decision nodes
- YES and NO branching
- Editable AI prompts
- AI-powered workflow decisions
- Dynamic workflow traversal
- Inngest workflow execution
- Execution order tracking
- Visual execution state
- Animated active edges

## Project Structure

- `frontend/` - Next.js and React Flow application
- `backend/` - FastAPI AI decision API

## Running the Project

Start the frontend:

```bash
cd frontend
npm run dev

Start the FastAPI backend:
cd backend
source backendenv/bin/activate
uvicorn main:app --reload --port 8000

Start Inngest:
cd frontend
npx inngest-cli@latest dev

Open the frontend at:
http://localhost:3000

Save with:

**Control + O → Enter → Control + X**

Then run:

```bash
git status
