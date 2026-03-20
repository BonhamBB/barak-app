"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/utils/api";
import PropertyFinancialSummary from "@/components/property/PropertyFinancialSummary";
import Wrapper from "@/layouts/Wrapper";

interface Property {
  id: number;
  title: string;
  address?: string;
  rentPerSqm: number;
  mgmtFee: number;
  arnonaPerSqm: number;
  totalArea: number;
  isTechDiscount: boolean;
  addedBy: "admin" | "client";
}

interface Client {
  id: number;
  unique_slug: string;
  displayName?: string;
}

export default function ClientDashboardPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    address: "",
    rentPerSqm: "",
    mgmtFee: "",
    arnonaPerSqm: "",
    totalArea: "",
    title: "",
  });

  const loadData = () => {
    if (!slug) return;
    Promise.all([
      api.get(`/clients/${slug}`),
      api.get(`/clients/${slug}/properties`),
    ])
      .then(([clientRes, propsRes]) => {
        setClient(clientRes.data);
        setProperties(propsRes.data);
      })
      .catch(() => setClient(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${slug}/properties`, {
        address: addForm.address,
        rentPerSqm: Number(addForm.rentPerSqm),
        mgmtFee: Number(addForm.mgmtFee),
        arnonaPerSqm: Number(addForm.arnonaPerSqm),
        totalArea: Number(addForm.totalArea),
        title: addForm.title || addForm.address,
      });
      setAddForm({
        address: "",
        rentPerSqm: "",
        mgmtFee: "",
        arnonaPerSqm: "",
        totalArea: "",
        title: "",
      });
      setShowAddForm(false);
      loadData();
    } catch {
      // Error handling could use toast
    }
  };

  if (loading) {
    return (
      <Wrapper>
        <div className="container py-5 text-center">Loading…</div>
      </Wrapper>
    );
  }

  if (!client) {
    return (
      <Wrapper>
        <div className="container py-5 text-center">
          <p className="text-muted">Client not found.</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="container py-5">
        <header className="mb-5">
          <h1 className="h3 fw-600 mb-2">
            {client.displayName || client.unique_slug}
          </h1>
          <p className="text-muted mb-0">
            Your curated properties with Tech Discount breakdown
          </p>
        </header>

        <div className="mb-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "Cancel" : "+ Add New Property"}
          </button>
          <span className="ms-2 small text-muted">
            Add properties you found elsewhere to compare with our calculator
          </span>
        </div>

        {showAddForm && (
          <div className="bg-white shadow-sm border rounded-3 p-4 mb-5">
            <h5 className="mb-3">Add Property for Comparison</h5>
            <form onSubmit={handleAddProperty}>
              <div className="row g-3 mb-3">
                <div className="col-12">
                  <label className="form-label">Address / Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rothschild 22, Tel Aviv"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm({ ...addForm, address: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Rent (₪/m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={addForm.rentPerSqm}
                    onChange={(e) =>
                      setAddForm({ ...addForm, rentPerSqm: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Mgmt Fee (₪)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={addForm.mgmtFee}
                    onChange={(e) =>
                      setAddForm({ ...addForm, mgmtFee: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Arnona (₪/m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={addForm.arnonaPerSqm}
                    onChange={(e) =>
                      setAddForm({ ...addForm, arnonaPerSqm: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Area (m²)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={addForm.totalArea}
                    onChange={(e) =>
                      setAddForm({ ...addForm, totalArea: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Add & Compare
              </button>
            </form>
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white shadow-sm border rounded-3 p-5 text-center text-muted">
            No properties yet. Add one above or wait for your admin to assign
            properties.
          </div>
        ) : (
          <div className="row g-4">
            {properties.map((p) => (
              <div key={p.id} className="col-md-6 col-lg-4">
                <div className="bg-white shadow-sm border rounded-3 p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{p.title}</h5>
                    {p.addedBy === "client" && (
                      <span className="badge bg-secondary">You added</span>
                    )}
                  </div>
                  {p.address && (
                    <p className="small text-muted mb-3">{p.address}</p>
                  )}
                  <div className="mb-3">
                    <span className="small text-muted">
                      {p.totalArea} m² · Rent {p.rentPerSqm} ₪/m²
                    </span>
                  </div>
                  <PropertyFinancialSummary
                    property={p as unknown as Record<string, unknown>}
                    variant="detail"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
