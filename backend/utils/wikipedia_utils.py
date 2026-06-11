import wikipedia
import wikipediaapi
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

wiki_wiki = wikipediaapi.Wikipedia(
    language='en',
    extract_format=wikipediaapi.ExtractFormat.WIKI,
    user_agent='ResearchAssistant/1.0 (research-assistant@example.com)'
)


def search_wikipedia(query: str, num_results: int = 5) -> List[str]:
    """Search Wikipedia and return list of article titles."""
    try:
        results = wikipedia.search(query, results=num_results)
        return results
    except Exception as e:
        logger.error(f"Wikipedia search error: {e}")
        return []


def get_article_summary(title: str) -> Optional[str]:
    """Get the summary of a Wikipedia article."""
    try:
        summary = wikipedia.summary(title, sentences=10, auto_suggest=True)
        return summary
    except wikipedia.DisambiguationError as e:
        try:
            summary = wikipedia.summary(e.options[0], sentences=10)
            return summary
        except Exception:
            return None
    except Exception as e:
        logger.error(f"Wikipedia summary error for '{title}': {e}")
        return None


def get_full_article(title: str) -> Optional[Dict]:
    """Get full article content from Wikipedia."""
    try:
        page = wiki_wiki.page(title)
        if not page.exists():
            return None

        sections = {}
        for section in page.sections:
            sections[section.title] = section.text[:2000] if section.text else ""

        return {
            "title": page.title,
            "summary": page.summary[:3000],
            "url": page.fullurl,
            "sections": sections,
            "categories": list(page.categories.keys())[:10],
        }
    except Exception as e:
        logger.error(f"Wikipedia full article error for '{title}': {e}")
        return None


def research_topic(topic: str) -> Dict:
    """Comprehensive research on a topic using Wikipedia."""
    logger.info(f"Researching topic: {topic}")

    search_results = search_wikipedia(topic, num_results=5)
    
    articles = []
    all_summaries = []
    references = []

    for title in search_results[:5]:
        try:
            article = get_full_article(title)
            if article:
                articles.append(article)
                all_summaries.append(f"**{article['title']}**\n{article['summary']}")
                references.append(f"Wikipedia: {article['title']} - {article['url']}")
        except Exception as e:
            logger.warning(f"Could not fetch article '{title}': {e}")
            # Try summary fallback
            summary = get_article_summary(title)
            if summary:
                all_summaries.append(f"**{title}**\n{summary}")
                references.append(f"Wikipedia: {title} - https://en.wikipedia.org/wiki/{title.replace(' ', '_')}")

    combined_content = "\n\n---\n\n".join(all_summaries)

    return {
        "topic": topic,
        "search_results": search_results,
        "articles": articles,
        "combined_content": combined_content,
        "references": references,
        "total_sources": len(articles),
    }
