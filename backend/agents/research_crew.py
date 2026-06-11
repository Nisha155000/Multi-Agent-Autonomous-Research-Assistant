import logging
import re
from datetime import datetime
from typing import Callable, Optional
from crewai import Crew, Process

from agents.crew_agents import (
    create_research_agent,
    create_analysis_agent,
    create_fact_verification_agent,
    create_report_writer_agent,
)
from agents.crew_tasks import (
    create_research_task,
    create_analysis_task,
    create_verification_task,
    create_report_task,
)
from utils.wikipedia_utils import research_topic

logger = logging.getLogger(__name__)


def parse_report_sections(full_report: str) -> dict:
    """Parse the full report text into individual sections."""
    sections = {
        "executive_summary": "",
        "introduction": "",
        "background": "",
        "key_findings": "",
        "detailed_analysis": "",
        "verified_facts": "",
        "conclusion": "",
        "references": "",
    }

    section_patterns = {
        "executive_summary": r"(?:##?\s*)?EXECUTIVE SUMMARY\s*\n(.*?)(?=##?\s*(?:INTRODUCTION|BACKGROUND|KEY FINDINGS|DETAILED ANALYSIS|VERIFIED FACTS|CONCLUSION|REFERENCES)|$)",
        "introduction": r"(?:##?\s*)?INTRODUCTION\s*\n(.*?)(?=##?\s*(?:BACKGROUND|KEY FINDINGS|DETAILED ANALYSIS|VERIFIED FACTS|CONCLUSION|REFERENCES)|$)",
        "background": r"(?:##?\s*)?BACKGROUND(?:\s+INFORMATION)?\s*\n(.*?)(?=##?\s*(?:KEY FINDINGS|DETAILED ANALYSIS|VERIFIED FACTS|CONCLUSION|REFERENCES)|$)",
        "key_findings": r"(?:##?\s*)?KEY FINDINGS\s*\n(.*?)(?=##?\s*(?:DETAILED ANALYSIS|VERIFIED FACTS|CONCLUSION|REFERENCES)|$)",
        "detailed_analysis": r"(?:##?\s*)?DETAILED ANALYSIS\s*\n(.*?)(?=##?\s*(?:VERIFIED FACTS|CONCLUSION|REFERENCES)|$)",
        "verified_facts": r"(?:##?\s*)?VERIFIED FACTS\s*\n(.*?)(?=##?\s*(?:CONCLUSION|REFERENCES)|$)",
        "conclusion": r"(?:##?\s*)?CONCLUSION\s*\n(.*?)(?=##?\s*REFERENCES|$)",
        "references": r"(?:##?\s*)?REFERENCES\s*\n(.*?)$",
    }

    for section_key, pattern in section_patterns.items():
        match = re.search(pattern, full_report, re.DOTALL | re.IGNORECASE)
        if match:
            sections[section_key] = match.group(1).strip()

    return sections


async def run_research_crew(
    topic: str,
    session_id: str,
    progress_callback: Optional[Callable] = None,
    log_callback: Optional[Callable] = None,
) -> dict:
    """
    Run the full multi-agent research crew for a given topic.
    Returns parsed report sections.
    """

    def update_progress(progress: float, agent: str, action: str, details: str = ""):
        if progress_callback:
            progress_callback(progress, agent)
        if log_callback:
            log_callback(agent, action, details)
        logger.info(f"[{agent}] {action}: {details}")

    try:
        # Step 1: Wikipedia Research
        update_progress(0.1, "Research Agent", "Starting Wikipedia research", f"Searching for: {topic}")
        wiki_data = research_topic(topic)
        
        update_progress(0.2, "Research Agent", "Wikipedia data collected",
                        f"Found {wiki_data['total_sources']} sources")

        wikipedia_content = wiki_data["combined_content"]
        references_text = "\n".join(wiki_data["references"])

        if not wikipedia_content.strip():
            wikipedia_content = f"Limited Wikipedia data found for '{topic}'. Proceeding with general knowledge."

        # Step 2: Create agents
        update_progress(0.25, "System", "Initializing agents", "Creating CrewAI agents")
        research_agent = create_research_agent()
        analysis_agent = create_analysis_agent()
        verification_agent = create_fact_verification_agent()
        writer_agent = create_report_writer_agent()

        # Step 3: Create tasks
        research_task = create_research_task(research_agent, topic, wikipedia_content)
        analysis_task = create_analysis_task(analysis_agent, topic)
        verification_task = create_verification_task(verification_agent, topic)
        report_task = create_report_task(writer_agent, topic)

        # Add context dependencies
        analysis_task.context = [research_task]
        verification_task.context = [research_task, analysis_task]
        report_task.context = [research_task, analysis_task, verification_task]

        # Step 4: Build crew
        update_progress(0.3, "System", "Building crew", "Assembling agent team")
        crew = Crew(
            agents=[research_agent, analysis_agent, verification_agent, writer_agent],
            tasks=[research_task, analysis_task, verification_task, report_task],
            process=Process.sequential,
            verbose=True,
        )

        # Step 5: Execute with progress tracking
        update_progress(0.35, "Research Agent", "Analyzing Wikipedia content", "Processing gathered data")
        
        # Kickoff the crew
        result = crew.kickoff()

        update_progress(0.9, "Report Writer Agent", "Report generation complete", "Finalizing document")

        # Parse results
        full_report = str(result)
        sections = parse_report_sections(full_report)

        # Add references from Wikipedia if not included
        if not sections["references"].strip():
            sections["references"] = references_text

        # Ensure we have content in key sections
        if not sections["executive_summary"].strip():
            sections["executive_summary"] = f"This report presents research findings on the topic of {topic}, compiled from Wikipedia sources. The research covers background information, key findings, and analysis of the subject matter."

        sections["full_report"] = full_report
        sections["topic"] = topic
        sections["wikipedia_data"] = wiki_data

        update_progress(1.0, "System", "Research complete", "All agents finished")

        return sections

    except Exception as e:
        logger.error(f"Research crew error: {e}", exc_info=True)
        update_progress(1.0, "System", "Error occurred", str(e))
        raise
