import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nurfita Project Control",
  description: "Sistem laporan lapangan dan monitoring progres landscape PT Nurfita Karya Mandiri.",
  other: {
    "application-name": "Nurfita Project Control",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
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
