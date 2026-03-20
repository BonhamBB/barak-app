"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Client {
  id: number;
  unique_slug: string;
  displayName?: string;
}

export default function AdminAddPropertyPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address: "",
    rentPerSqm: "",
    mgmtFee: "",
    arnonaPerSqm: "",
    totalArea: "",
    clientId: "",
    newClientName: "",
    useNewClient: false,
  });

  useEffect(() => {
    api
      .get("/clients")
      .then((res) => setClients(res.data))
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let clientId = form.clientId ? Number(form.clientId) : null;
      if (form.useNewClient && form.newClientName.trim()) {
        const clientRes = await api.post("/clients", {
          companyName: form.newClientName.trim(),
          displayName: form.newClientName.trim(),
        });
        clientId = clientRes.data.id;
      }
      await api.post("/properties", {
        address: form.address,
        rentPerSqm: Number(form.rentPerSqm),
        mgmtFee: Number(form.mgmtFee),
        arnonaPerSqm: Number(form.arnonaPerSqm),
        totalArea: Number(form.totalArea),
        clientId,
      });
      toast.success("Property added successfully!");
      setForm({
        address: "",
        rentPerSqm: "",
        mgmtFee: "",
        arnonaPerSqm: "",
        totalArea: "",
        clientId: "",
        newClientName: "",
        useNewClient: false,
      });
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to add property";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="bg-white shadow-sm border rounded-3 p-4 p-md-5">
            <h1 className="h3 mb-4 fw-600">Add New Property</h1>
            <p className="text-muted mb-4">
              Add a property and assign it to a client. Tech Discount is applied by default.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-500">Address *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Azrieli Center, Tel Aviv"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-500">Rent (₪/m²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="180"
                    value={form.rentPerSqm}
                    onChange={(e) => setForm({ ...form, rentPerSqm: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-500">Mgmt Fee (₪) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="35"
                    value={form.mgmtFee}
                    onChange={(e) => setForm({ ...form, mgmtFee: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-500">Arnona (₪/m²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="32"
                    value={form.arnonaPerSqm}
                    onChange={(e) => setForm({ ...form, arnonaPerSqm: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-500">Area (m²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    placeholder="500"
                    value={form.totalArea}
                    onChange={(e) => setForm({ ...form, totalArea: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="useNewClient"
                    checked={form.useNewClient}
                    onChange={(e) =>
                      setForm({ ...form, useNewClient: e.target.checked, clientId: "" })
                    }
                  />
                  <label className="form-check-label" htmlFor="useNewClient">
                    Create new client
                  </label>
                </div>
                {form.useNewClient ? (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Company name (e.g. Acme Tech)"
                    value={form.newClientName}
                    onChange={(e) => setForm({ ...form, newClientName: e.target.value })}
                  />
                ) : (
                  <select
                    className="form-select"
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    <option value="">— Select client (optional) —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName || c.unique_slug}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading}
                >
                  {loading ? "Adding…" : "Add Property"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setForm({
                      address: "",
                      rentPerSqm: "",
                      mgmtFee: "",
                      arnonaPerSqm: "",
                      totalArea: "",
                      clientId: "",
                      newClientName: "",
                      useNewClient: false,
                    })
                  }
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
