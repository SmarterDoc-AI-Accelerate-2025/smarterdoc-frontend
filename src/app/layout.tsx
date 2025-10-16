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
  title: "SmarterDoc",
  description: "Smart guidance to the right doctor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <body className="antialiased bg-white">{children}</body>
    </html>
  );
}
