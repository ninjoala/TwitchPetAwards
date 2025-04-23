import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { ClerkProvider } from "@clerk/nextjs";
import Image from "next/image";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: 'The Pet Awards',
  description: 'Vote for your Favorite Pet Clip!',
  icons: {
    icon: '/favicon.ico?v=2',
  },
  openGraph: {
    title: 'The Pet Awards',
    description: 'Vote for your Favorite Pet Clip!',
    url: 'https://thepetawards.tv',
    siteName: 'The Pet Awards',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Pet Awards - Vote for your Favorite Pet Clip',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Pet Awards',
    description: 'Vote for your Favorite Pet Clip!',
    images: ['/images/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased relative`}>
          <div className="absolute top-4 right-4 w-24 sm:w-32 md:w-40">
            <Image
              src="/logo.png"
              alt="The Pet Awards Logo"
              width={160}
              height={160}
              className="w-full h-auto"
              priority
            />
          </div>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
