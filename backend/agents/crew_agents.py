from crewai import Agent
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

load_dotenv()


def get_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.3,
        api_key=os.getenv("OPENAI_API_KEY")
    )


def create_research_agent() -> Agent:
    return Agent(
        role="Senior Research Analyst",
        goal=(
            "Search and gather comprehensive information about the research topic "
            "from Wikipedia. Extract key facts, dates, events, entities, and relevant data."
        ),
        backstory=(
            "You are an expert research analyst with 15 years of experience in academic "
            "and professional research. You specialize in gathering information from "
            "encyclopedic sources, identifying the most relevant and accurate data, "
            "and structuring raw information for further analysis. You are thorough, "
            "methodical, and always cite your sources."
        ),
        llm=get_llm(),
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )


def create_analysis_agent() -> Agent:
    return Agent(
        role="Expert Data Analyst",
        goal=(
            "Analyze research findings, remove duplicates, identify trends and patterns, "
            "find advantages/disadvantages, and structure information into logical sections."
        ),
        backstory=(
            "You are a brilliant data analyst and strategic thinker with expertise in "
            "synthesizing complex information. You excel at finding patterns in data, "
            "identifying key insights, and organizing information in a way that tells "
            "a compelling and accurate story. You eliminate noise and focus on what matters most."
        ),
        llm=get_llm(),
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )


def create_fact_verification_agent() -> Agent:
    return Agent(
        role="Fact Verification Specialist",
        goal=(
            "Verify information consistency, detect contradictions, assign confidence "
            "scores to findings, and produce a verified list of facts."
        ),
        backstory=(
            "You are a meticulous fact-checker with a background in investigative journalism "
            "and academic peer review. You have an exceptional eye for inconsistencies, "
            "contradictions, and unverified claims. You assign confidence scores based on "
            "the quality and consistency of sources, and you clearly flag anything uncertain."
        ),
        llm=get_llm(),
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )


def create_report_writer_agent() -> Agent:
    return Agent(
        role="Professional Report Writer",
        goal=(
            "Generate a comprehensive, professional research report with executive summary, "
            "introduction, background, key findings, detailed analysis, verified facts, "
            "conclusion, and references."
        ),
        backstory=(
            "You are an award-winning technical writer and journalist with expertise in "
            "crafting clear, compelling, and professional research reports. You have written "
            "hundreds of research reports for Fortune 500 companies, government agencies, "
            "and academic institutions. Your reports are known for being insightful, "
            "well-structured, and accessible to both expert and general audiences."
        ),
        llm=get_llm(),
        verbose=True,
        allow_delegation=False,
        max_iter=5,
    )
