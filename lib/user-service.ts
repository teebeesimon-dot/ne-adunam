import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { resolveInitialRole, SUPER_ADMIN_EMAILS } from "@/lib/roles";
import type { UserProfile, UserRole } from "@/lib/types";
import { mapUserProfile } from "@/lib/users";

export async function saveUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, "users", user.uid);
  const existing = await getDoc(ref);
  const email = user.email ?? "";
  const displayName = user.displayName ?? "";

  if (existing.exists()) {
    const updates: Record<string, unknown> = {
      displayName,
      email,
      updatedAt: Timestamp.now(),
    };

    if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
      updates.role = "super_admin";
    }

    await updateDoc(ref, updates);
    const data = { ...existing.data(), ...updates };
    return mapUserProfile(user.uid, data);
  }

  const profile = {
    uid: user.uid,
    displayName,
    email,
    role: resolveInitialRole(email),
    createdAt: Timestamp.now(),
  };

  await setDoc(ref, profile);
  return mapUserProfile(user.uid, profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return mapUserProfile(snap.id, snap.data());
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((docSnap) => mapUserProfile(docSnap.id, docSnap.data()))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "ro"));
}

export async function updateUserRole(
  uid: string,
  role: UserRole
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    role,
    updatedAt: Timestamp.now(),
  });
}
