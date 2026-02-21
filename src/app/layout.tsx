import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "evryWear - Your AI Personal Stylist",
  description: "Digitize your wardrobe and get AI-powered outfit suggestions for any occasion",
  keywords: ["wardrobe", "AI", "fashion", "outfit", "stylist", "clothing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen`}>
        {/* Animated gradient mesh background */}
        <div className="mesh-gradient">
          <div className="mesh-blob mesh-blob-1" />
          <div className="mesh-blob mesh-blob-2" />
          <div className="mesh-blob mesh-blob-3" />
        </div>

        <Header />
        <main className="pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
