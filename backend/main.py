import asyncio
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from db.models import (
    AgentLog, ResearchReport, ResearchSession,
    SessionLocal, create_tables, get_db
)
from agents.research_crew import run_research_crew
from utils.pdf_utils import generate_pdf_report

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory session state for real-time updates
session_states: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Research Assistant API...")
    try:
        create_tables()
        logger.info("Database tables created/verified")
    except Exception as e:
        logger.warning(f"Database setup warning: {e}")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Multi-Agent Research Assistant API",
    description="AI-powered research system using CrewAI agents",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class StartResearchRequest(BaseModel):
    topic: str


class ResearchStatusResponse(BaseModel):
    session_id: str
    topic: str
    status: str
    progress: float
    current_agent: Optional[str]
    created_at: str
    completed_at: Optional[str]
    agent_logs: list


class ReportResponse(BaseModel):
    session_id: str
    topic: str
    executive_summary: Optional[str]
    introduction: Optional[str]
    background: Optional[str]
    key_findings: Optional[str]
    detailed_analysis: Optional[str]
    verified_facts: Optional[str]
    conclusion: Optional[str]
    references: Optional[str]
    created_at: str


# ─── Background Research Task ─────────────────────────────────────────────────

async def execute_research(session_id: str, topic: str):
    """Background task to run the research crew."""
    db = SessionLocal()
    try:
        session_states[session_id] = {
            "status": "running",
            "progress": 0.0,
            "current_agent": "Initializing",
            "logs": []
        }

        def progress_callback(progress: float, agent: str):
            session_states[session_id]["progress"] = progress
            session_states[session_id]["current_agent"] = agent
            
            # Update DB
            try:
                session = db.query(ResearchSession).filter(
                    ResearchSession.id == session_id
                ).first()
                if session:
                    session.progress = progress
                    session.current_agent = agent
                    db.commit()
            except Exception:
                pass

        def log_callback(agent: str, action: str, details: str = ""):
            log_entry = {
                "agent": agent,
                "action": action,
                "details": details,
                "timestamp": datetime.utcnow().isoformat()
            }
            session_states[session_id]["logs"].append(log_entry)
            
            # Store in DB
            try:
                log = AgentLog(
                    session_id=session_id,
                    agent_name=agent,
                    action=action,
                    details=details,
                    status="info"
                )
                db.add(log)
                db.commit()
            except Exception:
                pass

        # Run the research crew
        result = await run_research_crew(
            topic=topic,
            session_id=session_id,
            progress_callback=progress_callback,
            log_callback=log_callback,
        )

        # Save report to DB
        report = ResearchReport(
            session_id=session_id,
            topic=topic,
            executive_summary=result.get("executive_summary", ""),
            introduction=result.get("introduction", ""),
            background=result.get("background", ""),
            key_findings=result.get("key_findings", ""),
            detailed_analysis=result.get("detailed_analysis", ""),
            verified_facts=result.get("verified_facts", ""),
            conclusion=result.get("conclusion", ""),
            references=result.get("references", ""),
            full_report=result.get("full_report", ""),
        )
        db.add(report)

        # Generate PDF
        try:
            pdf_path = generate_pdf_report(result, session_id)
            report.pdf_path = pdf_path
        except Exception as e:
            logger.error(f"PDF generation failed: {e}")

        # Update session status
        session = db.query(ResearchSession).filter(
            ResearchSession.id == session_id
        ).first()
        if session:
            session.status = "completed"
            session.progress = 1.0
            session.completed_at = datetime.utcnow()

        db.commit()

        session_states[session_id]["status"] = "completed"
        session_states[session_id]["progress"] = 1.0
        logger.info(f"Research completed for session {session_id}")

    except Exception as e:
        logger.error(f"Research failed for session {session_id}: {e}", exc_info=True)
        
        session_states[session_id]["status"] = "failed"
        session_states[session_id]["error"] = str(e)
        
        try:
            session = db.query(ResearchSession).filter(
                ResearchSession.id == session_id
            ).first()
            if session:
                session.status = "failed"
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "Multi-Agent Research Assistant API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/research/start")
async def start_research(
    request: StartResearchRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new research session."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    session = ResearchSession(topic=request.topic.strip())
    db.add(session)
    db.commit()
    db.refresh(session)

    background_tasks.add_task(execute_research, session.id, session.topic)

    return {
        "session_id": session.id,
        "topic": session.topic,
        "status": "started",
        "message": f"Research started for topic: {session.topic}"
    }


@app.get("/api/research/status/{session_id}")
async def get_research_status(session_id: str, db: Session = Depends(get_db)):
    """Get current status of a research session."""
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    in_memory = session_states.get(session_id, {})
    logs = db.query(AgentLog).filter(
        AgentLog.session_id == session_id
    ).order_by(AgentLog.timestamp).all()

    return {
        "session_id": session.id,
        "topic": session.topic,
        "status": in_memory.get("status", session.status),
        "progress": in_memory.get("progress", session.progress),
        "current_agent": in_memory.get("current_agent", session.current_agent),
        "created_at": session.created_at.isoformat(),
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
        "error": in_memory.get("error"),
        "agent_logs": [
            {
                "agent": log.agent_name,
                "action": log.action,
                "details": log.details,
                "timestamp": log.timestamp.isoformat(),
                "status": log.status
            }
            for log in logs
        ]
    }


@app.get("/api/research/report/{session_id}")
async def get_report(session_id: str, db: Session = Depends(get_db)):
    """Get the generated research report."""
    report = db.query(ResearchReport).filter(
        ResearchReport.session_id == session_id
    ).first()

    if not report:
        session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        in_memory = session_states.get(session_id, {})
        status = in_memory.get("status", session.status)
        
        if status == "running":
            raise HTTPException(status_code=202, detail="Research still in progress")
        elif status == "failed":
            raise HTTPException(status_code=500, detail="Research failed")
        else:
            raise HTTPException(status_code=404, detail="Report not found")

    return {
        "session_id": report.session_id,
        "topic": report.topic,
        "executive_summary": report.executive_summary,
        "introduction": report.introduction,
        "background": report.background,
        "key_findings": report.key_findings,
        "detailed_analysis": report.detailed_analysis,
        "verified_facts": report.verified_facts,
        "conclusion": report.conclusion,
        "references": report.references,
        "full_report": report.full_report,
        "created_at": report.created_at.isoformat(),
        "has_pdf": bool(report.pdf_path)
    }


@app.get("/api/research/download/{session_id}")
async def download_pdf(session_id: str, db: Session = Depends(get_db)):
    """Download the PDF report."""
    report = db.query(ResearchReport).filter(
        ResearchReport.session_id == session_id
    ).first()

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if not report.pdf_path or not os.path.exists(report.pdf_path):
        # Try to regenerate the PDF
        try:
            report_data = {
                "topic": report.topic,
                "executive_summary": report.executive_summary,
                "introduction": report.introduction,
                "background": report.background,
                "key_findings": report.key_findings,
                "detailed_analysis": report.detailed_analysis,
                "verified_facts": report.verified_facts,
                "conclusion": report.conclusion,
                "references": report.references,
            }
            pdf_path = generate_pdf_report(report_data, session_id)
            report.pdf_path = pdf_path
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {e}")

    return FileResponse(
        path=report.pdf_path,
        media_type="application/pdf",
        filename=f"research_report_{report.topic[:30].replace(' ', '_')}.pdf"
    )


@app.get("/api/research/history")
async def get_research_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get research history."""
    sessions = db.query(ResearchSession).order_by(
        ResearchSession.created_at.desc()
    ).offset(skip).limit(limit).all()

    total = db.query(ResearchSession).count()

    return {
        "total": total,
        "sessions": [
            {
                "session_id": s.id,
                "topic": s.topic,
                "status": s.status,
                "progress": s.progress,
                "created_at": s.created_at.isoformat(),
                "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            }
            for s in sessions
        ]
    }


@app.delete("/api/research/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a research session and its report."""
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.query(AgentLog).filter(AgentLog.session_id == session_id).delete()
    db.query(ResearchReport).filter(ResearchReport.session_id == session_id).delete()
    db.delete(session)
    db.commit()

    if session_id in session_states:
        del session_states[session_id]

    return {"message": "Session deleted successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
