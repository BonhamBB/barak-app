"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/utils/api";

interface AnalysisResult {
  areaSqm: number;
  purchasePrice: number;
  renovationPerSqm: number;
  renovationCost: number;
  totalInvestment: number;
  expectedValue: number;
  profit: number;
  roiPercent: number;
  isViable: boolean;
}

export default function DealAnalysisPage() {
  const [form, setForm] = useState({
    areaSqm: "100",
    purchasePrice: "2000000",
    expectedValue: "2800000",
    renovationPerSqm: "4500",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post("/real-estate/analyze", {
        areaSqm: Number(form.areaSqm),
        purchasePrice: Number(form.purchasePrice),
        expectedValue: Number(form.expectedValue),
        renovationPerSqm: Number(form.renovationPerSqm) || 4500,
      });
      setResult(res.data);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "שגיאה בניתוח";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const formatILS = (n: number) => `₪${n.toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;

  return (
    <div className="container">
      <Link href="/admin" className="text-muted small text-decoration-none d-block mb-3">
        ← Admin
      </Link>

      <div
        className="deal-analysis-card rounded-3 p-4 p-md-5 mb-4"
        style={{
          background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
          border: "1px solid #f5d042",
          boxShadow: "0 8px 32px rgba(245, 208, 66, 0.15)",
        }}
      >
        <h1
          className="h3 mb-2 fw-700"
          style={{ color: "#f5d042", fontFamily: "inherit" }}
        >
          Real Estate Brain
        </h1>
        <p className="mb-4" style={{ color: "#aaa", fontSize: "0.95rem" }}>
          ניתוח כדאיות עסקה – מעטפת לגמר (4,500 ₪/מ&quot;ר)
        </p>

        <form onSubmit={handleSubmit} className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label" style={{ color: "#f5d042", fontWeight: 600 }}>
              שטח (מ&quot;ר)
            </label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
              }}
              value={form.areaSqm}
              onChange={(e) => setForm({ ...form, areaSqm: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" style={{ color: "#f5d042", fontWeight: 600 }}>
              מחיר רכישה (₪)
            </label>
            <input
              type="number"
              className="form-control"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
              }}
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" style={{ color: "#f5d042", fontWeight: 600 }}>
              ערך צפוי לאחר שיפוץ (₪)
            </label>
            <input
              type="number"
              className="form-control"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
              }}
              value={form.expectedValue}
              onChange={(e) => setForm({ ...form, expectedValue: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label" style={{ color: "#f5d042", fontWeight: 600 }}>
              עלות שיפוץ למ&quot;ר (₪)
            </label>
            <input
              type="number"
              className="form-control"
              style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
              }}
              value={form.renovationPerSqm}
              onChange={(e) => setForm({ ...form, renovationPerSqm: e.target.value })}
            />
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn fw-600 px-4"
              style={{
                background: "#f5d042",
                color: "#0d0d0d",
                border: "none",
              }}
              disabled={loading}
            >
              {loading ? "מחשב…" : "נתח עסקה"}
            </button>
          </div>
        </form>

        {error && (
          <div
            className="alert mb-0"
            style={{ background: "rgba(220,53,69,0.2)", color: "#ff6b6b", border: "1px solid #dc3545" }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            className="rounded-3 p-4 mt-4"
            style={{
              background: "rgba(245, 208, 66, 0.08)",
              border: "1px solid rgba(245, 208, 66, 0.3)",
            }}
          >
            <h5 className="mb-3" style={{ color: "#f5d042" }}>
              תוצאות הניתוח
            </h5>
            <div className="row g-3">
              <div className="col-6 col-md-4">
                <span style={{ color: "#888", fontSize: "0.85rem" }}>עלות שיפוץ</span>
                <div style={{ color: "#fff", fontWeight: 600 }}>{formatILS(result.renovationCost)}</div>
              </div>
              <div className="col-6 col-md-4">
                <span style={{ color: "#888", fontSize: "0.85rem" }}>השקעה כוללת</span>
                <div style={{ color: "#fff", fontWeight: 600 }}>{formatILS(result.totalInvestment)}</div>
              </div>
              <div className="col-6 col-md-4">
                <span style={{ color: "#888", fontSize: "0.85rem" }}>רווח צפוי</span>
                <div
                  style={{
                    color: result.profit >= 0 ? "#4ade80" : "#f87171",
                    fontWeight: 700,
                  }}
                >
                  {formatILS(result.profit)}
                </div>
              </div>
              <div className="col-6 col-md-4">
                <span style={{ color: "#888", fontSize: "0.85rem" }}>ROI</span>
                <div
                  style={{
                    color: result.roiPercent >= 15 ? "#4ade80" : "#f5d042",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  {result.roiPercent}%
                </div>
              </div>
              <div className="col-6 col-md-4">
                <span style={{ color: "#888", fontSize: "0.85rem" }}>כדאיות</span>
                <div>
                  <span
                    className="badge"
                    style={{
                      background: result.isViable ? "#22c55e" : "#6b7280",
                      color: "#fff",
                      fontSize: "0.9rem",
                    }}
                  >
                    {result.isViable ? "✓ כדאי" : "לא כדאי"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
