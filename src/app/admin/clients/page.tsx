"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

interface Client {
  id: number;
  unique_slug: string;
  displayName?: string;
  email?: string;
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [magicSending, setMagicSending] = useState(false);

  const loadClients = () => {
    api
      .get("/clients")
      .then((res) => setClients(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    api
      .post("/clients", { companyName: newName.trim(), displayName: newName.trim() })
      .then(() => {
        setNewName("");
        loadClients();
        toast.success("Client created");
      })
      .catch(() => toast.error("Failed to create client"));
  };

  const copyLink = (slug: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const handleMagicOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail.trim()) return;
    setMagicSending(true);
    try {
      await api.post("/clients/magic-onboard", { email: magicEmail.trim() });
      setMagicEmail("");
      loadClients();
      toast.success("Email sent! Client onboarded.");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : "Failed to send";
      toast.error(String(msg));
    } finally {
      setMagicSending(false);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 fw-600">Clients</h1>
        <Link href="/admin" className="btn btn-outline-primary">
          Add Property
        </Link>
      </div>
      <div className="row">
        <div className="col-lg-6">
          <div className="bg-white shadow-sm border rounded-3 p-4 mb-4">
            <h5 className="mb-3">Magic Onboard</h5>
            <p className="small text-muted mb-2">Enter email to create client, generate AI message, and send dashboard link.</p>
            <form onSubmit={handleMagicOnboard} className="d-flex gap-2 mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="hr@wix.com"
                value={magicEmail}
                onChange={(e) => setMagicEmail(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={magicSending}>
                {magicSending ? "Sending…" : "Send"}
              </button>
            </form>
          </div>
          <div className="bg-white shadow-sm border rounded-3 p-4 mb-4">
            <h5 className="mb-3">Add Client (manual)</h5>
            <form onSubmit={handleAdd} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Company name (e.g. Acme Tech)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-primary">
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm border rounded-3 overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-muted">Loading…</div>
        ) : clients.length === 0 ? (
          <div className="p-5 text-center text-muted">No clients yet. Add one above.</div>
        ) : (
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Company</th>
                <th>Client Dashboard Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/clients/${c.id}`} className="text-decoration-none fw-500">
                      {c.displayName || c.unique_slug}
                    </Link>
                  </td>
                  <td>
                    <code className="small">/dashboard/{c.unique_slug}</code>
                  </td>
                  <td>
                    <a
                      href={`/dashboard/${c.unique_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary me-1"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => copyLink(c.unique_slug)}
                    >
                      Copy Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
