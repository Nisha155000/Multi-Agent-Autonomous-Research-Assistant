from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    Table, TableStyle, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)

PDF_OUTPUT_DIR = "generated_pdfs"
os.makedirs(PDF_OUTPUT_DIR, exist_ok=True)


def generate_pdf_report(report_data: dict, session_id: str) -> str:
    """Generate a professional PDF report from research data."""
    
    filename = f"{PDF_OUTPUT_DIR}/report_{session_id}.pdf"
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=1 * inch,
        bottomMargin=0.75 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor('#1e3a5f'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#4a6fa5'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    heading1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#1e3a5f'),
        spaceBefore=16,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        borderPad=4,
    )
    
    heading2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=colors.HexColor('#2c5282'),
        spaceBefore=12,
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=16,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=8,
        alignment=TA_JUSTIFY
    )
    
    highlight_style = ParagraphStyle(
        'Highlight',
        parent=styles['Normal'],
        fontSize=10,
        leading=16,
        textColor=colors.HexColor('#1a202c'),
        spaceAfter=6,
        leftIndent=20,
        backColor=colors.HexColor('#ebf8ff'),
        borderPad=8,
    )

    story = []

    # Header
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph("RESEARCH REPORT", title_style))
    story.append(Paragraph(f"Topic: {report_data.get('topic', 'Unknown')}", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", subtitle_style))
    story.append(Spacer(1, 0.1 * inch))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1e3a5f')))
    story.append(Spacer(1, 0.2 * inch))

    # Helper to add section
    def add_section(title: str, content: str, style=body_style):
        if content and content.strip():
            story.append(Paragraph(title, heading1_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#bee3f8')))
            story.append(Spacer(1, 0.1 * inch))
            
            paragraphs = content.strip().split('\n')
            for para in paragraphs:
                para = para.strip()
                if para:
                    if para.startswith('**') and para.endswith('**'):
                        story.append(Paragraph(para.replace('**', ''), heading2_style))
                    elif para.startswith('•') or para.startswith('-'):
                        story.append(Paragraph(para, highlight_style))
                    else:
                        clean_para = para.replace('**', '<b>').replace('**', '</b>')
                        try:
                            story.append(Paragraph(clean_para, style))
                        except Exception:
                            story.append(Paragraph(para, style))
            story.append(Spacer(1, 0.15 * inch))

    # Report sections
    sections = [
        ("1. Executive Summary", report_data.get('executive_summary', '')),
        ("2. Introduction", report_data.get('introduction', '')),
        ("3. Background Information", report_data.get('background', '')),
        ("4. Key Findings", report_data.get('key_findings', '')),
        ("5. Detailed Analysis", report_data.get('detailed_analysis', '')),
        ("6. Verified Facts", report_data.get('verified_facts', '')),
        ("7. Conclusion", report_data.get('conclusion', '')),
        ("8. References", report_data.get('references', '')),
    ]

    for title, content in sections:
        if content and content.strip():
            add_section(title, content)

    # Footer info
    story.append(Spacer(1, 0.3 * inch))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#1e3a5f')))
    story.append(Spacer(1, 0.1 * inch))
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#718096'),
        alignment=TA_CENTER
    )
    story.append(Paragraph(
        "Generated by Multi-Agent Research Assistant | Powered by CrewAI & Wikipedia",
        footer_style
    ))

    try:
        doc.build(story)
        logger.info(f"PDF generated successfully: {filename}")
        return filename
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise
