import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Load Inter variable fonts from /public
const inter = localFont({
  src: [
    {
      path: "../../public/Inter-VariableFont_opsz,wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../public/Inter-Italic-VariableFont_opsz,wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SmarterDoc AI",
  description: "Smart guidance to the right doctor",
  icons: [
    { url: "/favicon.png", type: "image/png" },
    { url: "/favicon.ico", type: "image/x-icon" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
