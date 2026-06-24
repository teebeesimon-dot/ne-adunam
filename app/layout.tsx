import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/AuthButton";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthProvider";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appDescription =
  "Organizează evenimente sportive, confirmă prezența echipei și generează echipe aleatorii.";

const metadataBase = new URL(
  env.appUrl ?? "https://ne-adunam.vercel.app"
);

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: "Ne Adunam",
    template: "%s | Ne Adunam",
  },
  description: appDescription,
  applicationName: "Ne Adunam",
  keywords: [
    "evenimente sportive",
    "prezență",
    "echipe",
    "organizare",
    "România",
  ],
  authors: [{ name: "Ne Adunam" }],
  creator: "Ne Adunam",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    siteName: "Ne Adunam",
    title: "Ne Adunam",
    description: appDescription,
    url: metadataBase,
  },
  twitter: {
    card: "summary",
    title: "Ne Adunam",
    description: appDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#07100d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-background antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppHeader />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
