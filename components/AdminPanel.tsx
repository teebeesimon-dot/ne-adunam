"use client";

import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import { ROLE_LABELS } from "@/lib/roles";
import type { UserProfile, UserRole } from "@/lib/types";
import { updateUserRole } from "@/lib/user-service";
import { mapUserProfile } from "@/lib/users";

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(
          snapshot.docs
            .map((docSnap) => mapUserProfile(docSnap.id, docSnap.data()))
            .sort((a, b) => a.displayName.localeCompare(b.displayName, "ro"))
        );
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  async function handleRoleChange(targetUid: string, role: UserRole) {
    setError("");
    setUpdatingUid(targetUid);

    try {
      await updateUserRole(targetUid, role);
    } catch {
      setError("Could not update role. Try again.");
    } finally {
      setUpdatingUid(null);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
        <p className="text-zinc-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-700">Name</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Email</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Role</th>
                <th className="px-4 py-3 font-semibold text-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((profile) => {
                const isCurrentUser = profile.uid === user?.uid;
                const isSuperAdminUser = profile.role === "super_admin";

                return (
                  <tr key={profile.uid} className="border-b border-zinc-100">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {profile.displayName || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{profile.email}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                        {ROLE_LABELS[profile.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSuperAdminUser || isCurrentUser ? (
                        <span className="text-xs text-zinc-400">No actions</span>
                      ) : profile.role === "user" ? (
                        <button
                          type="button"
                          disabled={updatingUid === profile.uid}
                          onClick={() =>
                            handleRoleChange(profile.uid, "organizer")
                          }
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                        >
                          Promote to Organizer
                        </button>
                      ) : profile.role === "organizer" ? (
                        <button
                          type="button"
                          disabled={updatingUid === profile.uid}
                          onClick={() => handleRoleChange(profile.uid, "user")}
                          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60"
                        >
                          Demote to User
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
