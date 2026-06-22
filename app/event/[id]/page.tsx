import type { Metadata } from "next";
import EventPageClient from "@/components/EventPageClient";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Eveniment",
  description: "Detalii eveniment, confirmă prezența și vezi participanții.",
};

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  return (
    <div className="min-h-full bg-zinc-50">
      <EventPageClient id={id} />
    </div>
  );
}
