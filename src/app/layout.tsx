import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@wrksz/themes/next";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { Toaster } from "sonner";
import React from "react";

export const metadata: Metadata = {
  title: "hub-nav · Beautiful Desktop-style Browser Homepage",
  description: "A beautiful, OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management. 100% local, privacy-focused.",
  keywords: ["hub-nav", "browser homepage", "start page", "new tab", "bookmark manager", "desktop style", "drag and drop", "dark mode", "privacy focused", "local storage", "custom wallpaper"],
  icons: {
    icon: "https://ale160.com/favicon.ico",
  },
  openGraph: {
    title: "hub-nav · Beautiful Desktop-style Browser Homepage",
    description: "A beautiful, OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "hub-nav · Beautiful Desktop-style Browser Homepage",
    description: "A beautiful, OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="hub-nav-theme"
          >
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
