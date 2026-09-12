#!/usr/bin/env python3
"""
PDF Book Generator for The Quant Handbook
Produces an institutional-grade publication PDF with cover page,
running headers/footers, styled math, callouts, tables, and code snippets.
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Canvas that computes total pages dynamically and adds headers/footers."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header
        self.drawString(54, 748, "BRENT QUANT ENGINE")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawRightString(558, 748, "THE QUANT HANDBOOK — v1.0 PRODUCTION")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(54, 740, 558, 740)

        # Running Footer
        self.line(54, 52, 558, 52)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#dc2626"))
        self.drawString(54, 40, "CONFIDENTIAL")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        self.drawString(130, 40, "|  Institutional Risk Engine & Execution Bible")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_str)
        self.restoreState()


def build_pdf(output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0f172a")    # Slate 900
    c_secondary = colors.HexColor("#1e293b")  # Slate 800
    c_accent = colors.HexColor("#2563eb")     # Blue 600
    c_gold = colors.HexColor("#d97706")       # Amber 600
    c_text = colors.HexColor("#1e293b")       # Dark Charcoal
    c_muted = colors.HexColor("#64748b")      # Slate 500
    c_code_bg = colors.HexColor("#0f172a")    # Dark editor bg
    c_box_bg = colors.HexColor("#f8fafc")     # Light card bg
    c_callout_border = colors.HexColor("#3b82f6")

    # Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=36,
        textColor=c_primary,
        alignment=0,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=c_accent,
        alignment=0,
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'ChapterH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=19,
        textColor=c_primary,
        spaceBefore=16,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=c_secondary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=c_text,
        spaceAfter=8
    )

    quote_style = ParagraphStyle(
        'ForewordQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    math_title = ParagraphStyle(
        'MathTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_accent,
        spaceBefore=6,
        spaceAfter=4
    )

    math_block = ParagraphStyle(
        'MathFormula',
        parent=styles['Normal'],
        fontName='Courier-Bold',
        fontSize=9.5,
        leading=14,
        textColor=colors.HexColor("#1e3a8a"),
        alignment=1, # Center
        spaceBefore=4,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#e2e8f0"),
        spaceBefore=2,
        spaceAfter=2
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 30))
    story.append(Paragraph("THE QUANT HANDBOOK", title_style))
    story.append(Paragraph("Architecture, Mathematics & Operational Bible of the Brent Quant Engine", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=4, color=c_accent, spaceBefore=0, spaceAfter=22))

    cover_meta = [
        [Paragraph("<b>Version:</b>", body_style), Paragraph("1.0 — Production Edition", body_style)],
        [Paragraph("<b>System Name:</b>", body_style), Paragraph("Brent Multi-Asset Quantitative Trading Engine", body_style)],
        [Paragraph("<b>Target Asset Classes:</b>", body_style), Paragraph("Crypto (Perpetual Futures), Forex Majors, Global Equities", body_style)],
        [Paragraph("<b>Author / Stakeholder:</b>", body_style), Paragraph("Egerton & Brent Website Ecosystem", body_style)],
        [Paragraph("<b>Mathematical Models:</b>", body_style), Paragraph("Hurst Exponent, Yang-Zhang Volatility, Half-Kelly Criterion", body_style)],
        [Paragraph("<b>Defensive Core:</b>", body_style), Paragraph("Synthetic Stops, -3% Daily Circuit Breaker, Liquidation Gate", body_style)],
        [Paragraph("<b>Mobile Command:</b>", body_style), Paragraph("Telegram 2-Way Encrypted Control Hub (@Eclat_quant_bot)", body_style)],
        [Paragraph("<b>Date of Publication:</b>", body_style), Paragraph("September 2026", body_style)]
    ]
    t_cover = Table(cover_meta, colWidths=[130, 374])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_cover)
    story.append(Spacer(1, 30))

    foreword_card = [
        [Paragraph("<b>CORE PRINCIPLE: CAPITAL PRESERVATION ABOVE ALL</b><br/><br/>"
                   "<i>\"The elements of good trading are: (1) cutting losses, (2) cutting losses, and (3) cutting losses. "
                   "If you can follow these three rules, you may have a chance.\"</i> — <b>Ed Seykota</b><br/><br/>"
                   "Most retail traders approach markets asking: <i>'How much money can I make today?'</i><br/>"
                   "Institutional quantitative firms ask: <i>'What is the maximum I can lose on this trade, and how do I survive a black swan event?'</i><br/><br/>"
                   "This fundamental paradigm separates the 95% of retail accounts that blow up within 90 days from the quantitative systems that compound wealth over decades. "
                   "This engine is engineered from the first line of code with capital preservation as the primary objective, and alpha generation as the mathematical consequence of discipline.",
                   body_style)]
    ]
    t_foreword = Table(foreword_card, colWidths=[504])
    t_foreword.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
        ('BOX', (0,0), (-1,-1), 1.5, c_callout_border),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(t_foreword)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: SYSTEM ARCHITECTURE
    # =========================================================================
    story.append(Paragraph("CHAPTER 1: SYSTEM ARCHITECTURE & DATA PIPELINE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "The Brent Quant Engine operates on a decoupled <b>6-tier modular pipeline</b>. No individual strategy or module is permitted to execute trades directly; every decision must traverse institutional gates before order generation.",
        body_style
    ))

    arch_header_style = ParagraphStyle('ArchH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
    arch_layers = [
        [Paragraph("Layer", arch_header_style), Paragraph("Component Name", arch_header_style), Paragraph("Role & Operational Responsibility", arch_header_style)],
        [Paragraph("<b>Layer 1</b>", body_style), Paragraph("Market Data Router", body_style), Paragraph("Aggregates real-time feeds from CCXT (Crypto), Alpaca (Stocks), and MetaTrader 5 (Forex). Normalizes ticks into pre-allocated NumPy RingBuffers.", body_style)],
        [Paragraph("<b>Layer 2</b>", body_style), Paragraph("Intelligence & Macro Guards", body_style), Paragraph("Calculates market regimes (Hurst Exponent, Volatility), tracks Session liquidity (London/NY overlap), and scans economic calendars / news sentiment.", body_style)],
        [Paragraph("<b>Layer 3</b>", body_style), Paragraph("Strategy Ensemble & Scanner", body_style), Paragraph("Runs Trend Following (EMA Cross), Mean Reversion (Bollinger + RSI), and Breakout channels. Ranks pairs via Relative Strength and Currency Strength.", body_style)],
        [Paragraph("<b>Layer 4</b>", body_style), Paragraph("Institutional Risk Gate", body_style), Paragraph("Enforces 10 pre-trade criteria, Half-Kelly position sizing, dynamic leverage capping, liquidation price buffers, and the -3.0% daily circuit breaker.", body_style)],
        [Paragraph("<b>Layer 5</b>", body_style), Paragraph("Stealth Execution Engine", body_style), Paragraph("Maintains private Synthetic Stops in RAM (invisible to exchange books). Manages 2-stage exits: 50% TP1 scale-out + Chandelier trailing stop.", body_style)],
        [Paragraph("<b>Layer 6</b>", body_style), Paragraph("Telemetry & Mobile Hub", body_style), Paragraph("Streams audit logs to SQLite (WAL mode), powers the Terminal UI Dashboard, and handles 2-way remote commands via Telegram.", body_style)]
    ]
    t_arch = Table(arch_layers, colWidths=[65, 140, 299])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,1), (-1,-1), 5),
        ('BOTTOMPADDING', (0,1), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 2: MATHEMATICAL FOUNDATIONS
    # =========================================================================
    story.append(Paragraph("CHAPTER 2: MATHEMATICAL FOUNDATIONS OF OUR EDGE", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "Quantitative trading relies on statistical edges rather than opinions or patterns. Our bot incorporates three institutional quantitative models:",
        body_style
    ))

    # Hurst Exponent
    story.append(Paragraph("1. The Hurst Exponent (H) — Market Memory & Persistence", math_title))
    story.append(Paragraph(
        "Developed by Harold Edwin Hurst, the Hurst Exponent determines whether an asset series behaves as a random walk, exhibits trending persistence, or demonstrates mean-reverting behavior.",
        body_style
    ))
    h_box = [
        [Paragraph("<b>Rescaled Range Analysis (R/S Formulation):</b><br/>"
                   "E[ R(n) / S(n) ] = C * n^H  as  n -&gt; infinity<br/>"
                   "log( R(n) / S(n) ) = H * log(n) + log(C)", math_block)],
        [Paragraph("<b>Regime Classification Rules:</b><br/>"
                   "• <b>H &gt; 0.55 (Persistent / Trending)</b>: Past moves predict future moves. Bot unlocks <b>TrendFollowingStrategy</b>.<br/>"
                   "• <b>H &lt; 0.45 (Anti-Persistent / Mean Reverting)</b>: Price oscillates around mean. Bot unlocks <b>MeanReversionStrategy</b>.<br/>"
                   "• <b>0.45 &lt;= H &lt;= 0.55 (Geometric Brownian Motion)</b>: Random walk noise. Bot suppresses signals to prevent chop.", body_style)]
    ]
    t_h = Table(h_box, colWidths=[504])
    t_h.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_box_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_h)
    story.append(Spacer(1, 10))

    # Yang-Zhang Volatility
    story.append(Paragraph("2. Yang-Zhang Volatility Estimator", math_title))
    story.append(Paragraph(
        "Standard deviation of close prices ignores overnight gap risk and intraday high/low excursions. The Yang-Zhang estimator is minimum-variance, unbiased, and independent of both opening jump and drift.",
        body_style
    ))
    yz_box = [
        [Paragraph("<b>sigma_YZ^2 = sigma_open^2 + k * sigma_close^2 + (1 - k) * sigma_RS^2</b><br/>"
                   "where k = 0.34 / (1.34 + (n + 1) / (n - 1))", math_block)],
        [Paragraph("This high-fidelity volatility estimator continuously calibrates our Average True Range (ATR) dynamic stops, ensuring stops expand during volatile expansions and tighten during consolidations.", body_style)]
    ]
    t_yz = Table(yz_box, colWidths=[504])
    t_yz.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_box_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_yz)
    story.append(Spacer(1, 10))

    # Half-Kelly
    story.append(Paragraph("3. Half-Kelly Information Sizing", math_title))
    story.append(Paragraph(
        "To maximize compound geometric wealth while completely eliminating the risk of ruin, position size is determined via the Kelly Criterion, scaled by 0.5x (Half-Kelly) to account for parameter uncertainty:",
        body_style
    ))
    k_box = [
        [Paragraph("<b>f* = ( p * (b + 1) - 1 ) / b</b><br/>"
                   "<b>f_trade = min( 0.5 * f*, MaxRiskPct )</b>", math_block)],
        [Paragraph("• <b>p</b> = Empirical win rate across the rolling 30 trades (computed live from SQLite).<br/>"
                   "• <b>b</b> = Empirical payout ratio (Average Profit / Average Loss).<br/>"
                   "• <b>Edge Collapse Safeguard:</b> If edge collapses (f* &lt;= 0), sizing automatically drops to zero, preventing drawdowns.", body_style)]
    ]
    t_k = Table(k_box, colWidths=[504])
    t_k.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_box_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_k)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: DEFENSIVE ARCHITECTURE & RISK GATES
    # =========================================================================
    story.append(Paragraph("CHAPTER 3: DEFENSIVE ARCHITECTURE & THE 10 RISK GATES", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "Every potential order generated by any strategy must pass through <b>10 sequential pre-trade gates</b> before entering the execution queue. If any single gate fails, the order is dropped.",
        body_style
    ))

    gates_header_style = ParagraphStyle('GateH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
    gates_data = [
        [Paragraph("Gate #", gates_header_style), Paragraph("Gate Name", gates_header_style), Paragraph("Condition & Capital Protection Logic", gates_header_style)],
        [Paragraph("<b>Gate 1</b>", body_style), Paragraph("Actionable Direction", body_style), Paragraph("Enforces strict directionality (LONG or SHORT only; neutral signals discarded).", body_style)],
        [Paragraph("<b>Gate 2</b>", body_style), Paragraph("Confidence Floor", body_style), Paragraph("Rejects any signal with algorithmic confidence score &lt; 25%.", body_style)],
        [Paragraph("<b>Gate 3</b>", body_style), Paragraph("Regime Filter", body_style), Paragraph("Blocks trades if regime is HIGH_VOL_CHAOS or incompatible with strategy.", body_style)],
        [Paragraph("<b>Gate 4</b>", body_style), Paragraph("Session Guard", body_style), Paragraph("Verifies market open, spread tightness, and avoids illiquid off-hours sessions.", body_style)],
        [Paragraph("<b>Gate 5</b>", body_style), Paragraph("Event Blackout", body_style), Paragraph("Halts trade entries 15 minutes prior to high-impact economic news releases.", body_style)],
        [Paragraph("<b>Gate 6</b>", body_style), Paragraph("News Panic Filter", body_style), Paragraph("Scans live headlines using VADER NLP; blocks buys during negative sentiment crashes.", body_style)],
        [Paragraph("<b>Gate 7</b>", body_style), Paragraph("Portfolio Capacity", body_style), Paragraph("Enforces max 10 concurrent positions and validates capital availability.", body_style)],
        [Paragraph("<b>Gate 8</b>", body_style), Paragraph("Volatility Sizing", body_style), Paragraph("Scales position size inversely to ATR; risk is fixed at exactly 1.0% of equity.", body_style)],
        [Paragraph("<b>Gate 9</b>", body_style), Paragraph("Broker Minimum", body_style), Paragraph("Validates order size against exchange minimum notional / lot size rules.", body_style)],
        [Paragraph("<b>Gate 10</b>", body_style), Paragraph("Liquidation Guard", body_style), Paragraph("<b>(Leverage Gate)</b> Rejects any trade where liquidation price is within 1.5x ATR of entry.", body_style)]
    ]
    t_gates = Table(gates_data, colWidths=[55, 125, 324])
    t_gates.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_gates)
    story.append(Spacer(1, 12))

    story.append(Paragraph("The -3.0% Daily Circuit Breaker", h2_style))
    cb_box = [
        [Paragraph("<b>EMERGENCY PROTOCOL (DAILY CIRCUIT BREAKER):</b><br/>"
                   "If cumulative realized + unrealized daily losses reach <b>-3.0% of opening equity</b>:<br/>"
                   "1. The engine triggers an immediate <b>Kill Switch</b>.<br/>"
                   "2. All open positions are liquidated via aggressive IOC market orders across all brokers.<br/>"
                   "3. All pending synthetic stops and limit orders are revoked.<br/>"
                   "4. An emergency alert is dispatched to your Telegram phone.<br/>"
                   "5. All trading is strictly locked until the 00:00 UTC midnight reset.", body_style)]
    ]
    t_cb = Table(cb_box, colWidths=[504])
    t_cb.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#fef2f2")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#ef4444")),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_cb)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 4: ALPHA ENGINES (PROFIT MAXIMIZATION)
    # =========================================================================
    story.append(Paragraph("CHAPTER 4: ALPHA ENGINES & PROFIT MAXIMIZATION", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "To maximize returns while locking in safety, the engine implements two proprietary alpha drivers:",
        body_style
    ))

    story.append(Paragraph("1. Partial Scale-Out (TP1) & The \"Free Ride\" Chandelier Trail", h2_style))
    story.append(Paragraph(
        "Instead of closing 100% of a trade at a static take-profit or watching winning trades retrace to break-even, the execution engine runs an automated 3-stage exit:",
        body_style
    ))

    exit_header_style = ParagraphStyle('ExH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
    exit_stages = [
        [Paragraph("Exit Stage", exit_header_style), Paragraph("Trigger Price Coordinate", exit_header_style), Paragraph("Execution Logic & Capital Outcome", exit_header_style)],
        [Paragraph("<b>Stage 1: TP1</b>", body_style), Paragraph("Entry + (2.0 x ATR)", body_style), Paragraph("Instantly closes <b>50% of the position</b>, banking guaranteed cash profit.", body_style)],
        [Paragraph("<b>Stage 2: Risk-Free</b>", body_style), Paragraph("Entry + (0.2 x ATR)", body_style), Paragraph("Concurrently raises the stop-loss on the remaining 50% past break-even. <b>The trade is now mathematically risk-free.</b>", body_style)],
        [Paragraph("<b>Stage 3: Runner Trail</b>", body_style), Paragraph("Highest High - (2.5 x ATR)", body_style), Paragraph("Chandelier trailing stop ratchets upwards with every new high, riding trends for days without capping upside.", body_style)]
    ]
    t_ex = Table(exit_stages, colWidths=[90, 130, 284])
    t_ex.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ex)
    story.append(PageBreak())

    # Currency Strength Meter & Scanner
    story.append(Paragraph("2. Market Scanner: Relative Strength & Currency Strength Meter (CSM)", h2_style))
    story.append(Paragraph(
        "The engine does not cycle symbols alphabetically or pick trades at random. It ranks market breadth every 15 minutes:",
        body_style
    ))
    csm_box = [
        [Paragraph("• <b>Crypto & Equities (RS Ratio):</b> Ranks all assets by (Momentum / Volatility Ratio). Allocates capital exclusively to the top 3 highest-momentum leaders.<br/>"
                   "• <b>Forex (Currency Strength Meter):</b> Decomposes 28 forex pairs into net currency vectors for USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD. Automatically pairs the <b>absolute strongest currency</b> against the <b>absolute weakest currency</b> for maximum directional impulse.", body_style)]
    ]
    t_csm = Table(csm_box, colWidths=[504])
    t_csm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_box_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_csm)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 5: STEALTH EXECUTION & SYNTHETIC STOPS
    # =========================================================================
    story.append(Paragraph("CHAPTER 5: STEALTH EXECUTION & PRIVATE STOPS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "Retail traders consistently lose money because public exchange order books broadcast stop-loss orders to predatory High-Frequency Trading (HFT) algorithms and market maker liquidity sweeps.",
        body_style
    ))
    synth_card = [
        [Paragraph("<b>THE SYNTHETIC STOP PROTOCOL:</b><br/><br/>"
                   "1. <b>Zero Footprint:</b> Stop-loss and take-profit coordinates exist <b>only in private server RAM</b>. No resting orders are ever placed on exchange order books.<br/>"
                   "2. <b>Millisecond Tick Monitor:</b> The engine evaluates live bid/ask prices against private thresholds on every tick.<br/>"
                   "3. <b>Aggressive IOC Execution:</b> When a stop is breached, an Immediate-Or-Cancel market order is dispatched instantly.<br/>"
                   "4. <b>Institutional Stealth:</b> Market makers cannot see or front-run our stops because the order does not exist in the book until the millisecond it is executed.", body_style)]
    ]
    t_synth = Table(synth_card, colWidths=[504])
    t_synth.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('BOX', (0,0), (-1,-1), 1.5, colors.HexColor("#475569")),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_synth)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 6: 2-WAY MOBILE TELEGRAM HUB
    # =========================================================================
    story.append(Paragraph("CHAPTER 6: 2-WAY MOBILE COMMAND CENTER", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "The engine connects directly to your personal phone via <b>@Eclat_quant_bot</b>. Incoming requests are filtered through your strict Telegram User ID, blocking all unauthorized traffic.",
        body_style
    ))

    cmd_header_style = ParagraphStyle('CmdH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
    cmd_data = [
        [Paragraph("Command", cmd_header_style), Paragraph("Function & Return Telemetry", cmd_header_style)],
        [Paragraph("<b>/status</b>", body_style), Paragraph("Returns current portfolio equity, daily P&L ($ and %), circuit breaker status, and active position count.", body_style)],
        [Paragraph("<b>/positions</b>", body_style), Paragraph("Inspects all open trades: symbol, entry, mark price, P&L, stop price, and [TRAIL] / [BE] indicators.", body_style)],
        [Paragraph("<b>/pause</b>", body_style), Paragraph("Suspends new trade entries ahead of uncertain news while keeping trailing stops active on existing trades.", body_style)],
        [Paragraph("<b>/resume</b>", body_style), Paragraph("Restores automatic regime scanning, market evaluation, and trade entry execution.", body_style)],
        [Paragraph("<b>/closeall</b>", body_style), Paragraph("<b>Emergency Panic Button:</b> Instantly market-closes 100% of open positions across all asset classes.", body_style)],
        [Paragraph("<b>/report</b>", body_style), Paragraph("Generates a performance summary of today's closed trades, win rate, and net P&L from SQLite audit logs.", body_style)],
        [Paragraph("<b>/help</b>", body_style), Paragraph("Displays mobile command directory and operational syntax.", body_style)]
    ]
    t_cmd = Table(cmd_data, colWidths=[100, 404])
    t_cmd.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_cmd)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 7 & 8: OPERATIONS & ROADMAP
    # =========================================================================
    story.append(Paragraph("CHAPTER 7: OPERATIONAL PLAYBOOK & COMMANDS", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    
    code_box_1 = [
        [Paragraph("<b># 1. Starting the Bot (Paper Mode):</b><br/>"
                   "cd \"c:\\Users\\egerton\\Desktop\\BRENT WEBSITE\\quant_engine\"<br/>"
                   "python main.py --mode paper<br/><br/>"
                   "<b># 2. Running the 32-Test Verification Suite:</b><br/>"
                   "python -m pytest tests/ -v --tb=short<br/><br/>"
                   "<b># 3. Previewing the Terminal Dashboard Alone:</b><br/>"
                   "python -m monitoring.dashboard", code_style)]
    ]
    t_c1 = Table(code_box_1, colWidths=[504])
    t_c1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_code_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#334155")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_c1)
    story.append(Spacer(1, 14))

    story.append(Paragraph("CHAPTER 8: GROWTH & RESEARCH ROADMAP", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=8))
    story.append(Paragraph(
        "As capital compounds and the account matures, the engine follows an institutional milestone expansion roadmap:",
        body_style
    ))

    road_header_style = ParagraphStyle('RoadH', parent=body_style, textColor=colors.white, fontName='Helvetica-Bold')
    roadmap_data = [
        [Paragraph("Phase", road_header_style), Paragraph("Milestone Name", road_header_style), Paragraph("Status", road_header_style), Paragraph("Deliverable Scope", road_header_style)],
        [Paragraph("Phase 1", body_style), Paragraph("Core Engine + Tests", body_style), Paragraph("<font color='#16a34a'><b>COMPLETE</b></font>", body_style), Paragraph("Multi-asset router, regime filter, ring buffers, 20 tests.", body_style)],
        [Paragraph("Phase 2", body_style), Paragraph("Live Terminal UI", body_style), Paragraph("<font color='#16a34a'><b>COMPLETE</b></font>", body_style), Paragraph("6-panel Rich UI dashboard with live position cards.", body_style)],
        [Paragraph("Phase 3", body_style), Paragraph("Safe Leverage Mode", body_style), Paragraph("<font color='#16a34a'><b>COMPLETE</b></font>", body_style), Paragraph("Liquidation buffer checks, leverage tier manager.", body_style)],
        [Paragraph("Phase 4", body_style), Paragraph("Alpha Expansion", body_style), Paragraph("<font color='#16a34a'><b>COMPLETE</b></font>", body_style), Paragraph("Chandelier trailing stop, Relative Strength, Half-Kelly.", body_style)],
        [Paragraph("Phase 5", body_style), Paragraph("2-Way Mobile Hub", body_style), Paragraph("<font color='#16a34a'><b>COMPLETE</b></font>", body_style), Paragraph("Telegram bot command polling & alerts (@Eclat_quant_bot).", body_style)],
        [Paragraph("Phase 6", body_style), Paragraph("FastAPI Web UI", body_style), Paragraph("<font color='#2563eb'><b>UPCOMING</b></font>", body_style), Paragraph("Modern web dashboard with TradingView candlestick charts.", body_style)],
        [Paragraph("Phase 7", body_style), Paragraph("Automated Profit Vault", body_style), Paragraph("<font color='#2563eb'><b>UPCOMING</b></font>", body_style), Paragraph("Sweeps 30% of weekly profits into cold reserve wallet.", body_style)],
        [Paragraph("Phase 8", body_style), Paragraph("Cloud VPS 24/7", body_style), Paragraph("<font color='#2563eb'><b>UPCOMING</b></font>", body_style), Paragraph("Deploy systemd service on Linux VPS for zero-downtime execution.", body_style)],
        [Paragraph("Phase 9", body_style), Paragraph("Walk-Forward Optimizer", body_style), Paragraph("<font color='#2563eb'><b>UPCOMING</b></font>", body_style), Paragraph("Auto-calibrates EMA lengths and stop multipliers quarterly.", body_style)]
    ]
    t_road = Table(roadmap_data, colWidths=[55, 125, 75, 249])
    t_road.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_road)
    story.append(Spacer(1, 16))

    closing_box = [
        [Paragraph("<i>\"The Quant Handbook is maintained under active quantitative governance. Every modification to strategies, risk multipliers, and execution models should be documented within these pages as our system compounds.\"</i>", quote_style)]
    ]
    t_close = Table(closing_box, colWidths=[504])
    t_close.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_close)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF created at {output_pdf_path}")

if __name__ == "__main__":
    out = os.path.abspath(r"c:\Users\egerton\Desktop\BRENT WEBSITE\quant_engine\THE_QUANT_HANDBOOK.pdf")
    build_pdf(out)
