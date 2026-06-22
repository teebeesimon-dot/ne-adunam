export interface EventLocation {
  placeId: string;
  locationName: string;
  latitude: number;
  longitude: number;
}

export function getEventLocationName(event: {
  locationName?: string;
  location?: string;
}): string {
  return event.locationName || event.location || "";
}

export function getGoogleMapsUrl(event: {
  placeId?: string;
  locationName?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}): string | null {
  const name = getEventLocationName(event);

  if (event.placeId) {
    const params = new URLSearchParams({
      api: "1",
      query_place_id: event.placeId,
    });
    if (name) params.set("query", name);
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  if (event.latitude != null && event.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`;
  }

  return null;
}

export function toFirestoreLocation(location: EventLocation) {
  return {
    placeId: location.placeId,
    locationName: location.locationName,
    latitude: location.latitude,
    longitude: location.longitude,
    location: location.locationName,
  };
}
