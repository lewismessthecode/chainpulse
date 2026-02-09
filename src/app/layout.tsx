import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainPulse — BNB Chain Intelligence",
  description:
    "AI-powered onchain market intelligence dashboard for BNB Chain DeFi",
  openGraph: {
    title: "ChainPulse — BNB Chain Intelligence",
    description:
      "AI-powered onchain market intelligence dashboard for BNB Chain DeFi",
    type: "website",
    siteName: "ChainPulse",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChainPulse — BNB Chain Intelligence",
    description:
      "AI-powered onchain market intelligence dashboard for BNB Chain DeFi",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased bg-void text-warm-white`}
        style={{
          fontFamily: "var(--font-body)",
          ["--font-display" as string]:
            "'Instrument Serif', Georgia, serif",
        }}
      >
        <Sidebar />
        <main className="md:ml-14 min-h-screen p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}
