import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaShift — Light, redirected.",
  description:
    "Light that goes where you want it and stays out of your eyes.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
