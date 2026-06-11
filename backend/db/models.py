from sqlalchemy import Column, String, Text, DateTime, Float, Integer, JSON, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/research_assistant")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    topic = Column(String(500), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    progress = Column(Float, default=0.0)
    current_agent = Column(String(100), nullable=True)


class ResearchReport(Base):
    __tablename__ = "research_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    topic = Column(String(500), nullable=False)
    executive_summary = Column(Text, nullable=True)
    introduction = Column(Text, nullable=True)
    background = Column(Text, nullable=True)
    key_findings = Column(Text, nullable=True)
    detailed_analysis = Column(Text, nullable=True)
    verified_facts = Column(Text, nullable=True)
    conclusion = Column(Text, nullable=True)
    references = Column(Text, nullable=True)
    full_report = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    pdf_path = Column(String(500), nullable=True)


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    agent_name = Column(String(100), nullable=False)
    action = Column(String(200), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="info")  # info, success, error, warning


class WikipediaCache(Base):
    __tablename__ = "wikipedia_cache"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query = Column(String(500), nullable=False, unique=True)
    content = Column(Text, nullable=False)
    cached_at = Column(DateTime, default=datetime.utcnow)


def create_tables():
    Base.metadata.create_all(bind=engine)
