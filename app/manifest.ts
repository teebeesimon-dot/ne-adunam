import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ne Adunam",
    short_name: "Ne Adunam",
    description:
      "Organizează evenimente sportive și confirmă prezența echipei.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#059669",
    lang: "ro",
  };
}
