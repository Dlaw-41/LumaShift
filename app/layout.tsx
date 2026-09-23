import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LumaShift — Light where you want it",
  description:
    "LumaShift redirects harsh overhead light onto the walls—no rewiring, electrician, or landlord approval.",
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
