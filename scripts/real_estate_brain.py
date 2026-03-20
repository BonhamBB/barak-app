#!/usr/bin/env python3
"""
Real Estate Brain - Deal Viability Analyzer
מנתח כדאיות עסקה: חישוב עלות שיפוץ ממצב מעטפת למצב גמר + ROI
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class DealAnalysis:
    """תוצאות ניתוח העסקה"""
    area_sqm: float
    purchase_price: float
    renovation_per_sqm: float
    renovation_cost: float
    total_investment: float
    expected_value: float
    roi_percent: float
    profit: float
    is_viable: bool


def analyze_deal(
    area_sqm: float,
    purchase_price: float,
    expected_value: float,
    renovation_per_sqm: float = 4500.0,
) -> DealAnalysis:
    """
    מנתח כדאיות עסקה.
    
    Args:
        area_sqm: שטח במ"ר
        purchase_price: מחיר רכישה (ש"ח)
        expected_value: ערך צפוי לאחר שיפוץ (ש"ח)
        renovation_per_sqm: עלות שיפוץ למ"ר - מעטפת לגמר (ש"ח, ברירת מחדל 4,500)
    
    Returns:
        DealAnalysis עם כל החישובים
    """
    renovation_cost = area_sqm * renovation_per_sqm
    total_investment = purchase_price + renovation_cost
    profit = expected_value - total_investment
    roi_percent = (profit / total_investment * 100) if total_investment > 0 else 0.0
    is_viable = roi_percent >= 15  # 15% ROI מינימלי לכדאיות
    
    return DealAnalysis(
        area_sqm=area_sqm,
        purchase_price=purchase_price,
        renovation_per_sqm=renovation_per_sqm,
        renovation_cost=renovation_cost,
        total_investment=total_investment,
        expected_value=expected_value,
        roi_percent=roi_percent,
        profit=profit,
        is_viable=is_viable,
    )


def format_ils(value: float) -> str:
    """פורמט מספר לשקלים"""
    return f"₪{value:,.0f}"


def print_analysis(analysis: DealAnalysis) -> None:
    """הדפסת ניתוח למסך"""
    print("\n" + "=" * 50)
    print("  ניתוח כדאיות עסקה - Real Estate Brain")
    print("=" * 50)
    print(f"  שטח:           {analysis.area_sqm:,.0f} מ\"ר")
    print(f"  מחיר רכישה:    {format_ils(analysis.purchase_price)}")
    print(f"  עלות שיפוץ:   {format_ils(analysis.renovation_cost)} ({format_ils(analysis.renovation_per_sqm)}/מ\"ר)")
    print(f"  השקעה כוללת:   {format_ils(analysis.total_investment)}")
    print(f"  ערך צפוי:      {format_ils(analysis.expected_value)}")
    print("-" * 50)
    print(f"  רווח צפוי:     {format_ils(analysis.profit)}")
    print(f"  ROI:           {analysis.roi_percent:.1f}%")
    print(f"  כדאיות:        {'[V] כדאי' if analysis.is_viable else '[X] לא כדאי'}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) >= 4:
        area = float(sys.argv[1])
        purchase = float(sys.argv[2])
        expected = float(sys.argv[3])
        reno = float(sys.argv[4]) if len(sys.argv) > 4 else 4500.0
        a = analyze_deal(area, purchase, expected, reno)
        print_analysis(a)
        # JSON output for API
        print(json.dumps({
            "areaSqm": a.area_sqm,
            "purchasePrice": a.purchase_price,
            "renovationCost": a.renovation_cost,
            "totalInvestment": a.total_investment,
            "expectedValue": a.expected_value,
            "profit": a.profit,
            "roiPercent": round(a.roi_percent, 1),
            "isViable": a.is_viable,
        }))
    else:
        # Demo
        a = analyze_deal(100, 2_000_000, 2_800_000)
        print_analysis(a)
