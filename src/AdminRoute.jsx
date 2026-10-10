import { lazy, Suspense } from "react";

const AdminApp = lazy(() => import("./admin/AdminApp.jsx"));

export default function AdminRoute() {
  return (
    <Suspense fallback={<main className="admin-shell"><p className="admin-status">Loading admin tools…</p></main>}>
      <AdminApp />
    </Suspense>
  );
}
