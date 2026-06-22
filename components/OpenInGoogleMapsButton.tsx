import { getGoogleMapsUrl } from "@/lib/location";

interface OpenInGoogleMapsButtonProps {
  event: {
    placeId?: string;
    locationName?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  };
  className?: string;
}

export default function OpenInGoogleMapsButton({
  event,
  className = "",
}: OpenInGoogleMapsButtonProps) {
  const mapsUrl = getGoogleMapsUrl(event);

  if (!mapsUrl) {
    return null;
  }

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-card-foreground transition hover:bg-muted active:scale-[0.98] ${className}`}
    >
      Open in Google Maps
    </a>
  );
}
