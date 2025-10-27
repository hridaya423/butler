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
  title: "Butler - Your Personal Command Center",
  description: "Don't let deadlines slip. Connect your life with Butler. Unify Slack, Gmail, Teams, and more into one beautiful, customizable dashboard.",
  keywords: ["dashboard", "productivity", "integrations", "slack", "gmail", "teams"],
  authors: [{ name: "Butler" }],
  openGraph: {
    title: "Butler - Your Personal Command Center",
    description: "Don't let deadlines slip. Connect your life with Butler.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
