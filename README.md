# AarogyaAid AI Insurance Advisor

An AI-powered health insurance recommendation platform built using a RAG pipeline. It helps users discover the best health insurance policy based on their personal profile.

## Features
- **User Portal**: 6-field profile form (Name, Age, Lifestyle, Pre-existing conditions, Income band, City tier).
- **AI Agent**: Langchain-based agent utilizing Groq (`llama3-70b-8192`) and Tool calling to fetch real data from MongoDB and ChromaDB.
- **RAG Pipeline**: PDF document ingestion with PyMuPDF, chunking, and ChromaDB vector search.
- **Recommendation Engine**: Custom filter-rank-adjust pipeline to filter policies based on exclusions/affordability and rank them by waiting periods, co-pays, and coverage.
- **Admin Panel**: Dashboard to upload new policy PDFs, parse them into Vector DB, and delete them seamlessly.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Zustand
- **Backend**: FastAPI (Python), Motor (async MongoDB)
- **AI/DB**: LangChain, ChromaDB, PyMuPDF, Groq API

## Setup Instructions

### 1. Backend
```bash
cd backend
python -m venv venv
# activate venv: source venv/bin/activate (mac/linux) OR venv\Scripts\activate (windows)
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY and MONGODB_URI
uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### Usage
- Go to `http://localhost:5173/admin` to upload sample Policy PDFs.
- Go to `http://localhost:5173/` to use the User Portal and chat with the AI Agent.