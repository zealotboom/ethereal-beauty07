import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import AnimatedCursor from "@/components/AnimatedCursor";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "./globals.css";

const display = Playfair_Display({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-display", style: ["normal","italic"] });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Ethereal Beauty",
  description: "Luxury clothing and fine jewellery with AI styling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <AnimatedCursor />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
