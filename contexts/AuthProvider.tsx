"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, db } from "@/lib/firebase";
import { canCreateEvents, isSuperAdmin } from "@/lib/roles";
import type { UserProfile, UserRole } from "@/lib/types";
import { saveUserProfile } from "@/lib/user-service";
import { mapUserProfile } from "@/lib/users";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  canCreateEvents: boolean;
  isSuperAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (nextUser) {
        await saveUserProfile(nextUser);
      } else {
        setProfile(null);
      }
      setUser(nextUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(mapUserProfile(snapshot.id, snapshot.data()));
      } else {
        setProfile(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const role = profile?.role ?? null;

  const value = useMemo(
    () => ({
      user,
      profile,
      role,
      loading,
      canCreateEvents: canCreateEvents(role),
      isSuperAdmin: isSuperAdmin(role),
      signInWithGoogle,
      signOutUser,
    }),
    [user, profile, role, loading, signInWithGoogle, signOutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
