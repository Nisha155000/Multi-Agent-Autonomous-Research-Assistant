# 🤖 Multi-Agent Autonomous Research Assistant

A production-ready AI research system where **four specialized CrewAI agents** collaborate autonomously to research any topic, verify facts, and generate a comprehensive professional report — powered by Wikipedia and OpenAI.

---

## 🏗️ Architecture

```
User Input → Research Agent → Analysis Agent → Verification Agent → Writer Agent → PDF Report
                ↓                   ↓                  ↓                  ↓
           Wikipedia API       Trend Analysis      Fact Scoring      Full Report
           Key Facts          Pattern Detection   Confidence %      8 Sections
           Entity Extraction  Gap Identification  Contradiction      PDF Export
```

### Agent Roles

| Agent | Role | Responsibility |
|-------|------|----------------|
| 🔍 Research Agent | Senior Research Analyst | Searches Wikipedia, extracts facts/dates/entities |
| 📊 Analysis Agent | Expert Data Analyst | Identifies trends, patterns, pros/cons, insights |
| ✅ Fact Verification Agent | Fact-Check Specialist | Verifies consistency, assigns confidence scores |
| ✍️ Report Writer Agent | Professional Writer | Generates full 8-section research report |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS v3 + Dark Mode |
| **Backend** | FastAPI + Python 3.11 |
| **AI Agents** | CrewAI 0.30 + LangChain |
| **LLM** | OpenAI GPT-4o-mini |
| **Research** | Wikipedia API + wikipedia-api |
| **Database** | PostgreSQL 16 |
| **PDF** | ReportLab |
| **Container** | Docker + Docker Compose |

---

## 📁 Project Structure

```
research-assistant/
├── backend/
│   ├── agents/
│   │   ├── crew_agents.py      # CrewAI agent definitions
│   │   ├── crew_tasks.py       # Task definitions with context
│   │   └── research_crew.py   # Crew orchestration
│   ├── db/
│   │   └── models.py           # SQLAlchemy models + DB setup
│   ├── utils/
│   │   ├── wikipedia_utils.py  # Wikipedia API integration
│   │   └── pdf_utils.py        # ReportLab PDF generation
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx       # Top navigation bar
│   │   │   ├── SearchInput.tsx  # Topic input with examples
│   │   │   ├── AgentPanel.tsx   # Real-time agent activity
│   │   │   ├── ReportDisplay.tsx # Accordion report viewer
│   │   │   ├── HistoryPanel.tsx  # Slide-out history drawer
│   │   │   └── LoadingSkeleton.tsx
│   │   ├── hooks/
│   │   │   └── useDarkMode.ts
│   │   ├── utils/
│   │   │   └── api.ts           # API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
└── docker-compose.yml
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- **PostgreSQL** 16 (or use Docker)
- **OpenAI API key**

---

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone and enter directory
git clone <repo>
cd research-assistant

# 2. Set your OpenAI API key
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# 3. Start all services
docker-compose up --build

# 4. Open browser
open http://localhost:3000
```

---

### Option B: Manual Setup

#### Step 1 — PostgreSQL
```bash
# Using Docker just for the DB
docker run -d \
  --name research_postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=research_assistant \
  -p 5432:5432 \
  postgres:16-alpine

# Or create the DB manually
createdb research_assistant
```

#### Step 2 — Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set your OPENAI_API_KEY

# Start the API server
uvicorn main:app --reload --port 8000
```

#### Step 3 — Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/research/start` | Start a new research session |
| `GET` | `/api/research/status/{id}` | Poll session status + logs |
| `GET` | `/api/research/report/{id}` | Get the completed report |
| `GET` | `/api/research/download/{id}` | Download PDF report |
| `GET` | `/api/research/history` | List all past sessions |
| `DELETE` | `/api/research/{id}` | Delete a session |
| `GET` | `/health` | Health check |

### API Documentation
Interactive docs available at: `http://localhost:8000/docs`

### Example: Start Research
```bash
curl -X POST http://localhost:8000/api/research/start \
  -H "Content-Type: application/json" \
  -d '{"topic": "Quantum Computing"}'
```

Response:
```json
{
  "session_id": "uuid-here",
  "topic": "Quantum Computing",
  "status": "started",
  "message": "Research started for topic: Quantum Computing"
}
```

---

## 📊 Database Schema

```sql
research_sessions   -- Session tracking (id, topic, status, progress)
research_reports    -- Full reports (8 sections + pdf_path)
agent_logs          -- Per-agent activity logs
wikipedia_cache     -- Cached Wikipedia responses
```

---

## 📄 Report Structure

Every generated report includes:

1. **Executive Summary** — High-level overview of findings
2. **Introduction** — Context and research objectives  
3. **Background Information** — Historical context and origins
4. **Key Findings** — Bullet-pointed most important facts
5. **Detailed Analysis** — In-depth multi-section analysis
6. **Verified Facts** — Numbered list with confidence scores
7. **Conclusion** — Summary, implications, future outlook
8. **References** — All Wikipedia sources used

---

## ✨ Features

- **Real-time agent tracking** — Watch each agent work live
- **Progress visualization** — Animated progress bar per agent
- **Dark mode** — System preference + manual toggle
- **Research history** — Search and revisit past reports
- **PDF export** — Professional formatted PDF download
- **Agent activity logs** — Terminal-style live log viewer
- **Example topics** — Quick-start buttons for common topics
- **Responsive design** — Mobile-friendly layout

---

## ⚙️ Configuration

### Backend `.env`
```env
OPENAI_API_KEY=sk-...         # Required: your OpenAI key
DATABASE_URL=postgresql://... # PostgreSQL connection string
ENVIRONMENT=development       # development | production
```

### Frontend environment
Create `frontend/.env.local`:
```env
VITE_API_URL=http://localhost:8000
```

---

## 🔧 Customization

### Change the LLM model
In `backend/agents/crew_agents.py`:
```python
def get_llm():
    return ChatOpenAI(
        model="gpt-4o",          # or "gpt-3.5-turbo" for cheaper
        temperature=0.3,
    )
```

### Add more Wikipedia sources
In `backend/utils/wikipedia_utils.py`, increase results:
```python
search_results = search_wikipedia(topic, num_results=8)  # default 5
```

### Customize report sections
Edit task prompts in `backend/agents/crew_tasks.py`.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `OpenAI API error` | Check `OPENAI_API_KEY` in `.env` |
| `Database connection failed` | Ensure PostgreSQL is running |
| `Wikipedia no results` | Try a broader topic name |
| `PDF generation fails` | Check write permissions on `generated_pdfs/` |
| `Frontend can't reach backend` | Verify `VITE_API_URL` or Vite proxy config |

---

## 📈 Sample Output

**Topic:** *Artificial Intelligence*

The system produces ~2,000–4,000 word reports covering:
- Origins (1950s Turing, Dartmouth Conference)  
- Key milestones (Expert Systems, Deep Learning, LLMs)
- Applications, benefits, risks
- Verified facts with confidence scores (HIGH/MEDIUM/LOW)
- Future outlook and ethical considerations

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📝 License

MIT License — free to use, modify, and distribute.

---

*Built with CrewAI, FastAPI, React, and ❤️*
