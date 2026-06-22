import EditEventPageClient from "@/components/EditEventPageClient";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-full bg-zinc-50">
      <EditEventPageClient id={id} />
    </div>
  );
}
