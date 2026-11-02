import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scanboard",
  description: "Fixture app for evaluating the wow-moments skill.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <body>
        <header className="topbar">
          <Link href="/" className="brand">
            Scanboard
          </Link>
          <nav>
            <Link href="/projects">Projects</Link>
            <Link href="/settings">Settings</Link>
          </nav>
          <ThemeToggle />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
