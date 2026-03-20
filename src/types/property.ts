// Property financial fields (Barak-app custom)
export interface PropertyFinancialFields {
  rentPerSqm: number;
  mgmtFee: number;
  arnonaPerSqm: number;
  isTechDiscount: boolean;
  cleaningFee?: number; // default 12
  totalArea: number;
}

// Check if property has new financial fields
export function hasFinancialFields(p: Record<string, unknown>): p is Record<string, unknown> & PropertyFinancialFields {
  return (
    typeof p.rentPerSqm === "number" &&
    typeof p.mgmtFee === "number" &&
    typeof p.arnonaPerSqm === "number" &&
    typeof p.totalArea === "number"
  );
}

// Calculate Total Monthly Cost (NIS)
// Tech discount: ~20% off arnona for eligible tech companies
const TECH_DISCOUNT_RATE = 0.2;

export function calculateTotalMonthlyCost(p: PropertyFinancialFields): number {
  const rent = p.rentPerSqm * p.totalArea;
  const arnona = p.arnonaPerSqm * p.totalArea;
  const arnonaAfterDiscount = p.isTechDiscount ? arnona * (1 - TECH_DISCOUNT_RATE) : arnona;
  const cleaning = p.cleaningFee ?? 12;
  return rent + p.mgmtFee + arnonaAfterDiscount + cleaning;
}

export function getMonthlyCostBreakdown(p: PropertyFinancialFields) {
  const rent = p.rentPerSqm * p.totalArea;
  const arnona = p.arnonaPerSqm * p.totalArea;
  const arnonaAfterDiscount = p.isTechDiscount ? arnona * (1 - TECH_DISCOUNT_RATE) : arnona;
  const cleaning = p.cleaningFee ?? 12;
  const total = rent + p.mgmtFee + arnonaAfterDiscount + cleaning;
  return {
    rent,
    mgmtFee: p.mgmtFee,
    arnona: arnonaAfterDiscount,
    arnonaDiscount: p.isTechDiscount ? arnona * TECH_DISCOUNT_RATE : 0,
    cleaning,
    total,
  };
}
