import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "QAForge — Your QA career starts here",
  description:
    "An interactive software quality assurance career simulator. Investigate, test, report, and ship at Nexora Technologies.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
