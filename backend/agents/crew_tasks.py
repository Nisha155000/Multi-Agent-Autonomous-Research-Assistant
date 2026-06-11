from crewai import Task
from crewai import Agent


def create_research_task(agent: Agent, topic: str, wikipedia_content: str) -> Task:
    return Task(
        description=f"""
        Research the topic: "{topic}"
        
        You have been provided with the following Wikipedia research data:
        
        {wikipedia_content}
        
        Your job is to:
        1. Review all the provided Wikipedia content thoroughly
        2. Extract and organize key facts, dates, events, and important entities
        3. Identify the most important and relevant information
        4. Note any gaps in the information
        5. Organize findings into clear categories:
           - Historical background and timeline
           - Key people, organizations, or entities involved
           - Important events and milestones
           - Current state and recent developments
           - Statistical data and numbers (if available)
        
        Provide a comprehensive, well-organized research summary with all key information.
        Be specific and include actual facts, not generalizations.
        """,
        agent=agent,
        expected_output=(
            "A comprehensive research summary organized into clear sections with "
            "specific facts, dates, entities, and relevant data extracted from "
            "Wikipedia sources. Include at least 15-20 specific facts."
        )
    )


def create_analysis_task(agent: Agent, topic: str) -> Task:
    return Task(
        description=f"""
        Analyze the research findings about: "{topic}"
        
        Using the research findings from the previous task, perform deep analysis:
        
        1. **Identify Key Themes**: What are the 3-5 most important themes or aspects?
        2. **Analyze Trends**: What patterns or trends emerge from the data?
        3. **Pros and Cons**: What are the advantages/benefits and disadvantages/challenges?
        4. **Historical Context**: How does this topic fit into broader historical context?
        5. **Impact Assessment**: What has been the impact of this topic on society/science/culture?
        6. **Comparative Analysis**: How does this compare to related topics or alternatives?
        7. **Current Relevance**: Why is this topic significant today?
        8. **Knowledge Gaps**: What information is missing or unclear?
        
        Structure your analysis clearly with headers for each section.
        Remove any duplicate information and focus on unique insights.
        """,
        agent=agent,
        expected_output=(
            "A detailed analytical report with identified themes, trends, pros/cons, "
            "historical context, impact assessment, and key insights. "
            "Should be structured with clear sections and sub-sections."
        )
    )


def create_verification_task(agent: Agent, topic: str) -> Task:
    return Task(
        description=f"""
        Fact-check and verify research findings about: "{topic}"
        
        Review all the research and analysis from previous tasks and:
        
        1. **Verify Consistency**: Check that all facts are consistent throughout the research
        2. **Identify Contradictions**: Flag any conflicting information found
        3. **Assess Confidence Levels**: For each major claim, assign a confidence level:
           - HIGH CONFIDENCE (90-100%): Well-documented, multiple consistent sources
           - MEDIUM CONFIDENCE (70-89%): Generally accepted, minor uncertainties
           - LOW CONFIDENCE (50-69%): Limited sources or some contradictions
           - UNVERIFIED (<50%): Insufficient evidence or major contradictions
        4. **Extract Verified Facts**: Create a numbered list of 10-15 verified facts
        5. **Flag Uncertainties**: Clearly note what cannot be fully verified
        6. **Source Quality Assessment**: Comment on the reliability of Wikipedia as a source
        
        Format the verified facts list clearly with confidence scores.
        """,
        agent=agent,
        expected_output=(
            "A fact-verification report with confidence scores for major claims, "
            "a numbered list of 10-15 verified facts with confidence levels, "
            "identified contradictions (if any), and source quality assessment."
        )
    )


def create_report_task(agent: Agent, topic: str) -> Task:
    return Task(
        description=f"""
        Write a comprehensive professional research report about: "{topic}"
        
        Using ALL the research, analysis, and verified facts from previous agents,
        write a complete professional research report with the following EXACT structure:
        
        ## EXECUTIVE SUMMARY
        [2-3 paragraph overview of the entire research. What was studied, main findings, and significance.]
        
        ## INTRODUCTION
        [Set the context, explain why this topic matters, state the research objectives.]
        
        ## BACKGROUND INFORMATION
        [Historical context, origin story, foundational information about the topic.]
        
        ## KEY FINDINGS
        [Bullet-pointed list of the most important discoveries and facts from the research.]
        
        ## DETAILED ANALYSIS
        [In-depth analysis with multiple subsections covering themes, trends, impacts, and insights.]
        
        ## VERIFIED FACTS
        [Numbered list of verified facts with confidence levels from the fact-checking process.]
        
        ## CONCLUSION
        [Summary of findings, implications, future outlook, and closing thoughts.]
        
        ## REFERENCES
        [List all Wikipedia sources used in the research.]
        
        Make the report professional, informative, and engaging.
        Use clear headings, proper paragraphs, and professional language.
        The report should be comprehensive (at least 1500 words total).
        """,
        agent=agent,
        expected_output=(
            "A complete, professional research report with all 8 sections properly filled: "
            "Executive Summary, Introduction, Background, Key Findings, Detailed Analysis, "
            "Verified Facts, Conclusion, and References. Minimum 1500 words."
        )
    )
