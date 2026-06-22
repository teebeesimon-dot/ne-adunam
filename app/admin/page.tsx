import Link from "next/link";
import AdminPanel from "@/components/AdminPanel";
import RequireSuperAdmin from "@/components/RequireSuperAdmin";

export default function AdminPage() {
  return (
    <div className="min-h-full bg-zinc-50">
      <RequireSuperAdmin>
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            ← Back home
          </Link>

          <header className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900">Admin</h1>
            <p className="mt-2 text-zinc-600">
              Manage users and organizer access.
            </p>
          </header>

          <AdminPanel />
        </div>
      </RequireSuperAdmin>
    </div>
  );
}
