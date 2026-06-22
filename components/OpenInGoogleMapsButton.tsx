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
      className={`inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 active:scale-[0.98] ${className}`}
    >
      Open in Google Maps
    </a>
  );
}
