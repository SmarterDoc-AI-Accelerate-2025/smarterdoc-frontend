import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/colors.css";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SmarterDoc AI",
  description: "Smart guidance to the right doctor",
  icons: [{ url: "/favicon.png", type: "image/png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
