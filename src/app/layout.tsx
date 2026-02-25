import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "evryWear — Your AI Personal Stylist",
  description: "Digitize your wardrobe and get AI-powered outfit suggestions for any occasion",
  keywords: ["wardrobe", "AI", "fashion", "outfit", "stylist", "clothing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body suppressHydrationWarning className={`${inter.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <Header />
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
