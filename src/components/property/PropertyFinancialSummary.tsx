"use client";

import { hasFinancialFields, getMonthlyCostBreakdown } from "@/types/property";

interface PropertyFinancialSummaryProps {
  property: Record<string, unknown>;
  variant?: "card" | "detail";
}

export default function PropertyFinancialSummary({ property, variant = "card" }: PropertyFinancialSummaryProps) {
  if (!hasFinancialFields(property)) return null;

  const breakdown = getMonthlyCostBreakdown(property);

  if (variant === "card") {
    return (
      <div className="property-financial-summary">
        <strong className="price fw-500 color-dark">
          ₪{breakdown.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}<sub>/mo</sub>
        </strong>
        {property.isTechDiscount && (
          <span className="badge bg-success ms-2" style={{ fontSize: "0.7rem" }}>Tech Discount</span>
        )}
      </div>
    );
  }

  // Detail view: full breakdown
  return (
    <div className="property-financial-summary-detail p-40">
      <h4 className="mb-20">Monthly Cost Breakdown</h4>
      <ul className="style-none">
        <li className="d-flex justify-content-between py-2">
          <span>Rent ({property.rentPerSqm} ₪/m² × {property.totalArea} m²)</span>
          <span className="fw-500">₪{breakdown.rent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </li>
        <li className="d-flex justify-content-between py-2">
          <span>Management Fee</span>
          <span className="fw-500">₪{breakdown.mgmtFee.toLocaleString()}</span>
        </li>
        <li className="d-flex justify-content-between py-2">
          <span>Arnona ({property.arnonaPerSqm} ₪/m² × {property.totalArea} m²)
            {property.isTechDiscount && " (Tech Discount -20%)"}
          </span>
          <span className="fw-500">₪{breakdown.arnona.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </li>
        <li className="d-flex justify-content-between py-2">
          <span>Cleaning Fee</span>
          <span className="fw-500">₪{breakdown.cleaning.toLocaleString()}</span>
        </li>
      </ul>
      <div className="top-border pt-20 mt-20 d-flex justify-content-between align-items-center">
        <strong className="fs-20">Total Monthly Cost</strong>
        <strong className="fs-24 color-dark">₪{breakdown.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
      </div>
    </div>
  );
}
