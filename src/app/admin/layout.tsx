"use client";

import Link from "next/link";
import Wrapper from "@/layouts/Wrapper";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Wrapper>
    <div className="admin-dashboard">
      <header className="admin-header bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between py-3">
            <Link href="/admin" className="fw-600 fs-20 text-dark text-decoration-none">
              Barak Admin
            </Link>
            <nav className="d-flex gap-3">
              <Link href="/admin" className="text-dark text-decoration-none">
                Add Property
              </Link>
              <Link href="/admin/clients" className="text-dark text-decoration-none">
                Clients
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="admin-main py-5">{children}</main>
    </div>
    </Wrapper>
  );
}
