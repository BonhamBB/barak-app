"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

interface Client {
  id: number;
  unique_slug: string;
  displayName?: string;
  email?: string;
}

interface Property {
  id: number;
  title: string;
  address?: string;
  totalArea: number;
  clientId?: number;
}

export default function AdminClientCardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadClient = () => {
    api
      .get(`/clients/by-id/${id}`)
      .then((res) => setClient(res.data))
      .catch(() => {
        toast.error("Client not found");
        router.push("/admin/clients");
      })
      .finally(() => setLoading(false));
  };

  const loadProperties = () => {
    api.get("/properties").then((res) => setProperties(res.data));
  };

  useEffect(() => {
    loadClient();
    loadProperties();
  }, [id]);

  useEffect(() => {
    if (!client) return;
    api
      .get(`/clients/${client.unique_slug}/properties`)
      .then((res) => {
        const ids = new Set((res.data as Property[]).map((p) => p.id));
        setAssignedIds(ids);
      })
      .catch(() => setAssignedIds(new Set()));
  }, [client]);

  const toggleProperty = (propertyId: number) => {
    setAssignedIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) next.delete(propertyId);
      else next.add(propertyId);
      return next;
    });
  };

  const handleUpdateAndSend = async () => {
    if (!client) return;
    if (!client.email) {
      toast.error("Client has no email. Add email first.");
      return;
    }
    setUpdating(true);
    try {
      await api.post(`/clients/by-id/${client.id}/update-and-send-summary`, {
        propertyIds: Array.from(assignedIds),
      });
      toast.success("Dashboard updated and summary sent!");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : "Failed to update and send";
      toast.error(String(msg));
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !client) {
    return (
      <div className="container py-4">
        <div className="text-center text-muted">Loading…</div>
      </div>
    );
  }

  const dashboardLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/${client.unique_slug}`
      : `/dashboard/${client.unique_slug}`;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Link href="/admin/clients" className="text-muted small text-decoration-none me-2">
            ← Clients
          </Link>
          <h1 className="h3 fw-600 mb-0">{client.displayName || client.unique_slug}</h1>
          <p className="text-muted small mb-0 mt-1">
            {client.email && <span>{client.email}</span>}
            {client.email && " · "}
            <code className="small">/dashboard/{client.unique_slug}</code>
          </p>
        </div>
        <div className="d-flex gap-2">
          <a
            href={dashboardLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-primary"
          >
            Open Dashboard
          </a>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12">
          <div className="bg-white shadow-sm border rounded-3 p-4 mb-4">
            <h5 className="mb-3">Properties</h5>
            <p className="small text-muted mb-3">
              Check the properties you toured. Click Update & Send Summary to link them to
              this client and send the follow-up email.
            </p>
            {properties.length === 0 ? (
              <p className="text-muted small">No properties yet. Add properties first.</p>
            ) : (
              <div className="list-group list-group-flush mb-4">
                {properties.map((p) => (
                  <label
                    key={p.id}
                    className="list-group-item list-group-item-action d-flex align-items-center gap-2 cursor-pointer"
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={assignedIds.has(p.id)}
                      onChange={() => toggleProperty(p.id)}
                      className="form-check-input"
                    />
                    <span>
                      {p.title}
                      {p.address && (
                        <span className="text-muted small"> · {p.address}</span>
                      )}
                      <span className="text-muted small"> · {p.totalArea}m²</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-success"
              onClick={handleUpdateAndSend}
              disabled={updating || !client.email}
            >
              {updating ? "Updating…" : "Update & Send Summary"}
            </button>
            {!client.email && (
              <p className="small text-warning mt-2 mb-0">
                Add client email (e.g. via Magic Onboard) to send.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
