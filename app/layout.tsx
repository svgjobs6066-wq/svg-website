import type { Metadata } from "next";
import { Inter_Tight, IBM_Plex_Mono, Noto_Sans_Tamil } from "next/font/google";
import { LanguageProvider } from "@/components/layout/provider";
import { PageMotion } from "@/components/layout/page-motion";
import "./globals.css";

const grotesk = Inter_Tight({
  variable: "--font-grotesk",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
});

export const metadata: Metadata = {
  title: {
    default: "SVG Careers — Make things. Build a career.",
    template: "%s | SVG Careers",
  },
  description:
    "Explore machining, fabrication, assembly and office opportunities at Sree Vijeyaganapathi & Co.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${mono.variable} ${tamil.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-full bg-white font-sans text-ink selection:bg-brand-orange/40">
        <LanguageProvider>
          <PageMotion />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
