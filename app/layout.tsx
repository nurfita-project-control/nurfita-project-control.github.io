import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nurfita Project Control",
  description: "Sistem pengendalian progres, laporan, dan biaya proyek landscape PT Nurfita Karya Mandiri.",
  other: {
    "application-name": "Nurfita Project Control",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
