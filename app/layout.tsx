import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Tamil } from "next/font/google";
import { LanguageProvider } from "@/components/layout/provider";
import { PageMotion } from "@/components/layout/page-motion";
import "./globals.css";

const geistSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Noto_Sans_Tamil({
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper font-sans text-ink selection:bg-brand-orange/40">
        <LanguageProvider>
          <PageMotion />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
