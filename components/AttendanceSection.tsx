"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { db } from "@/lib/firebase";
import {
  computeGoingLists,
  findUserGoingPosition,
  parseTimestamp,
} from "@/lib/going-list";
import { saveResponse } from "@/lib/responses";
import type {
  AttendanceStatus,
  ParticipantEntry,
  RankedParticipantEntry,
} from "@/lib/types";

interface AttendanceSectionProps {
  eventId: string;
  maxParticipants: number;
}

const MAYBE_CONFIG = {
  status: "poate" as const,
  label: "Poate",
  groupTitle: "Maybe",
  buttonClass: "bg-amber-500 hover:bg-amber-600 text-white",
  listClass: "border-amber-200 bg-amber-50",
};

const NOT_GOING_CONFIG = {
  status: "nu_vin" as const,
  label: "Nu vin",
  groupTitle: "Not Going",
  buttonClass: "bg-zinc-600 hover:bg-zinc-700 text-white",
  listClass: "border-zinc-200 bg-zinc-50",
};

const VIN_BUTTON_CLASS = "bg-emerald-600 hover:bg-emerald-700 text-white";

function getParticipantName(data: Record<string, unknown>): string {
  return (data.userName as string) || (data.name as string) || "Unknown";
}

function getParticipantPhoto(data: Record<string, unknown>): string | null {
  return (data.userPhoto as string | null) ?? null;
}

function sortByName(entries: ParticipantEntry[]): ParticipantEntry[] {
  return [...entries].sort((a, b) =>
    a.name.localeCompare(b.name, "ro", { sensitivity: "base" })
  );
}

function ParticipantAvatar({
  name,
  photoURL,
}: {
  name: string;
  photoURL: string | null;
}) {
  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full border border-zinc-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-600">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RankedParticipantList({
  title,
  participants,
  className,
  emptyMessage,
}: {
  title: string;
  participants: RankedParticipantEntry[];
  className: string;
  emptyMessage: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
        {title}
      </h3>
      {participants.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {participants.map((participant) => (
            <li
              key={participant.userId}
              className="flex items-center gap-3 rounded-lg bg-white/80 px-3 py-2"
            >
              <span className="w-8 shrink-0 text-xs font-bold text-emerald-700">
                {participant.positionLabel}
              </span>
              <ParticipantAvatar
                name={participant.name}
                photoURL={participant.photoURL}
              />
              <span className="text-sm font-medium text-zinc-800">
                {participant.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SimpleParticipantList({
  title,
  count,
  participants,
  className,
}: {
  title: string;
  count: number;
  participants: ParticipantEntry[];
  className: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
        {title} ({count})
      </h3>
      {participants.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">No one yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {participants.map((participant) => (
            <li
              key={participant.userId}
              className="flex items-center gap-3 rounded-lg bg-white/80 px-3 py-2"
            >
              <ParticipantAvatar
                name={participant.name}
                photoURL={participant.photoURL}
              />
              <span className="text-sm font-medium text-zinc-800">
                {participant.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AttendanceSection({
  eventId,
  maxParticipants,
}: AttendanceSectionProps) {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [confirmed, setConfirmed] = useState<RankedParticipantEntry[]>([]);
  const [waitlist, setWaitlist] = useState<RankedParticipantEntry[]>([]);
  const [maybe, setMaybe] = useState<ParticipantEntry[]>([]);
  const [notGoing, setNotGoing] = useState<ParticipantEntry[]>([]);
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus | null>(null);
  const [userPosition, setUserPosition] = useState<RankedParticipantEntry | null>(null);
  const [submitting, setSubmitting] = useState<AttendanceStatus | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "responses"),
      where("eventId", "==", eventId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goingInputs: {
        userId: string;
        name: string;
        photoURL: string | null;
        goingRegisteredAt: number;
      }[] = [];
      const maybeMap = new Map<string, ParticipantEntry>();
      const notGoingMap = new Map<string, ParticipantEntry>();
      let userStatus: AttendanceStatus | null = null;

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const status = data.status as AttendanceStatus;
        const userId = (data.userId as string) || docSnap.id;
        const entry: ParticipantEntry = {
          userId,
          name: getParticipantName(data),
          photoURL: getParticipantPhoto(data),
        };

        if (status === "vin") {
          goingInputs.push({
            userId,
            name: entry.name,
            photoURL: entry.photoURL,
            goingRegisteredAt: parseTimestamp(
              data.goingRegisteredAt ?? data.createdAt
            ),
          });
        } else if (status === "poate") {
          maybeMap.set(userId, entry);
        } else if (status === "nu_vin") {
          notGoingMap.set(userId, entry);
        }

        if (user && data.userId === user.uid) {
          userStatus = status;
        }
      });

      const lists = computeGoingLists(goingInputs, maxParticipants);
      setConfirmed(lists.confirmed);
      setWaitlist(lists.waitlist);
      setMaybe(sortByName(Array.from(maybeMap.values())));
      setNotGoing(sortByName(Array.from(notGoingMap.values())));
      setCurrentStatus(userStatus);
      setUserPosition(
        user && userStatus === "vin"
          ? findUserGoingPosition(user.uid, lists)
          : null
      );
    });

    return () => unsubscribe();
  }, [eventId, maxParticipants, user]);

  async function handleResponse(status: AttendanceStatus) {
    if (!user) return;

    setSubmitting(status);

    try {
      await saveResponse(
        eventId,
        user.uid,
        user.displayName ?? user.email ?? "User",
        user.photoURL,
        status
      );
    } finally {
      setSubmitting(null);
    }
  }

  if (authLoading) {
    return (
      <section className="mt-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-500">Se încarcă...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-zinc-900">Prezență</h2>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <p className="text-zinc-600">
            Sign in with Google to confirm your attendance.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Sign in with Google
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-xl font-semibold text-zinc-900">Prezență</h2>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <ParticipantAvatar
            name={user.displayName ?? "User"}
            photoURL={user.photoURL}
          />
          <div>
            <p className="font-medium text-zinc-900">{user.displayName}</p>
            {currentStatus === "vin" && userPosition && (
              <p className="text-sm text-zinc-500">
                {userPosition.isWaitlisted
                  ? `Waiting list: ${userPosition.positionLabel}`
                  : `Confirmed: ${userPosition.positionLabel}`}
              </p>
            )}
            {currentStatus && currentStatus !== "vin" && (
              <p className="text-sm text-zinc-500">
                Your response:{" "}
                {currentStatus === "poate" ? "Maybe" : "Not Going"}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => handleResponse("vin")}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              currentStatus === "vin"
                ? "ring-2 ring-offset-2 ring-emerald-500 " + VIN_BUTTON_CLASS
                : VIN_BUTTON_CLASS
            }`}
          >
            {submitting === "vin" ? "..." : "Vin"}
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => handleResponse("poate")}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              currentStatus === "poate"
                ? "ring-2 ring-offset-2 ring-emerald-500 " + MAYBE_CONFIG.buttonClass
                : MAYBE_CONFIG.buttonClass
            }`}
          >
            {submitting === "poate" ? "..." : MAYBE_CONFIG.label}
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => handleResponse("nu_vin")}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
              currentStatus === "nu_vin"
                ? "ring-2 ring-offset-2 ring-emerald-500 " + NOT_GOING_CONFIG.buttonClass
                : NOT_GOING_CONFIG.buttonClass
            }`}
          >
            {submitting === "nu_vin" ? "..." : NOT_GOING_CONFIG.label}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <RankedParticipantList
          title={`Going (${confirmed.length}/${maxParticipants})`}
          participants={confirmed}
          className="border-emerald-200 bg-emerald-50"
          emptyMessage="No confirmed players yet."
        />
        <RankedParticipantList
          title={`Waiting List (${waitlist.length})`}
          participants={waitlist}
          className="border-orange-200 bg-orange-50"
          emptyMessage="No one on the waiting list."
        />
        <SimpleParticipantList
          title={MAYBE_CONFIG.groupTitle}
          count={maybe.length}
          participants={maybe}
          className={MAYBE_CONFIG.listClass}
        />
        <SimpleParticipantList
          title={NOT_GOING_CONFIG.groupTitle}
          count={notGoing.length}
          participants={notGoing}
          className={NOT_GOING_CONFIG.listClass}
        />
      </div>
    </section>
  );
}
