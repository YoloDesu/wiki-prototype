import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0b1322",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://relaybridge-translated-support.bequel.chatgpt.site"),
  title: "RelayBridge — Live support, translated instantly",
  description: "A local visual demo of always-on translation across chat, voice, images and technical files.",
  applicationName: "RelayBridge",
  openGraph: {
    title: "RelayBridge — One call. Every voice understood.",
    description: "See an English and Japanese support call stay synchronized across every participant perspective.",
    url: "/",
    siteName: "RelayBridge",
    type: "website",
    images: [{ url: "/og-call.png", width: 1732, height: 909, alt: "RelayBridge bilingual support call" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RelayBridge — One call. Every voice understood.",
    description: "English and Japanese live support, synchronized in one call.",
    images: ["/og-call.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
