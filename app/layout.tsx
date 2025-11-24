import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Butler - Your Digital Life Framework",
  description: "A unified framework for managing your digital life. Connect Slack, Gmail, GitHub, Notion, and more into one intelligent command center.",
  keywords: ["framework", "dashboard", "productivity", "integrations", "slack", "gmail", "notion", "github"],
  authors: [{ name: "Butler" }],
  openGraph: {
    title: "Butler - Your Digital Life Framework",
    description: "A unified framework for managing your digital life.",
    type: "website",
  },
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
