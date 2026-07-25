import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TACT Lifestyle — Own Your Flex",
  description:
    "A responsive storefront concept for TACT Lifestyle, built with TACT-owned campaign and product media.",
  icons: {
    icon: "/assets/logo-black.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
