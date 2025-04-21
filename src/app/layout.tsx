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
  description: 'Submit your pet videos for The Pet Awards!',
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
