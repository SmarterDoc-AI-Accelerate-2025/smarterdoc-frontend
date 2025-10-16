import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Script from "next/script";

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
      <body className="antialiased bg-white">{children}
      {/* WUUNU SNIPPET - DON'T CHANGE THIS (START) */}
      {process.env.NODE_ENV !== "production" && (
        <>
          <Script id="wuunu-ws" strategy="afterInteractive">
            { `window.__WUUNU_WS__ = "http://127.0.0.1:63624/";` }
          </Script>
          <Script
            id="wuunu-widget"
            src="https://cdn.jsdelivr.net/npm/@wuunu/widget@0.1?cacheParam=699"
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        </>
      )}
      {/* WUUNU SNIPPET - DON'T CHANGE THIS (END) */}
</body>
    </html>
  );
}
