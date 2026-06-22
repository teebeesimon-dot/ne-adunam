declare global {
  interface Window {
    google?: typeof google;
  }
}

let loadPromise: Promise<typeof google> | null = null;

import { env } from "@/lib/env";

export function getGoogleMapsApiKey(): string | undefined {
  return env.googleMapsApiKey;
}

export function loadGoogleMapsPlaces(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only load in the browser"));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const apiKey = getGoogleMapsApiKey();

      if (!apiKey) {
        reject(new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"));
        return;
      }

      const script = document.createElement("script");

      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;

      script.async = true;
      script.defer = true;

      script.onload = () => {
        setTimeout(() => {
          if (window.google?.maps) {
            resolve(window.google);
          } else {
            reject(new Error("Google Maps failed to load"));
          }
        }, 1000);
      };

      script.onerror = () => {
        reject(new Error("Google Maps script failed to load"));
      };

      document.head.appendChild(script);
    });
  }

  return loadPromise;
}