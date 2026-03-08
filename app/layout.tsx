import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Narriv",
  description: "The narrative decision layer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
