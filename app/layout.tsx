import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0b1322",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "RelayBridge — Live support, translated instantly",
  description: "A local visual demo of always-on translation across chat, voice, images and technical files.",
  applicationName: "RelayBridge",
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
