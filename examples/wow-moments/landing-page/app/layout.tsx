import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tally: invoices in a minute",
  description: "Fixture landing page for testing the wow-moments skill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
