import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Inconsolata } from "next/font/google";
import "@/styles/globals.css";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.freecellwithfriends.com"),
  openGraph: {
    siteName: "FreeCell with Friends",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FreeCell with Friends daily challenge preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  authors: [
    {
      name: "Jialin Cai",
      url: "https://jialincai.com",
    },
  ],
};

type LayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" />
        <Script id="global-error-logger" strategy="beforeInteractive">
          {`
            window.addEventListener("error", function (event) {
              console.error("[global-error]", event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error && event.error.stack,
                userAgent: navigator.userAgent,
              });
            });
            window.addEventListener("unhandledrejection", function (event) {
              console.error("[unhandled-rejection]", event.reason, {
                userAgent: navigator.userAgent,
              });
            });
          `}
        </Script>
      </head>
      <body className={inconsolata.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
