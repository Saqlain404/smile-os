import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmileOS — Dental Practice Management",
  description:
    "The operating system for modern dental practices. Manage patients, appointments, billing, and more.",
  keywords: [
    "dental",
    "practice management",
    "patient management",
    "dental clinic",
    "appointment scheduling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
