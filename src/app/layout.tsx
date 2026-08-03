import "./globals.css";
import type {Metadata} from "next";
import {TooltipProvider} from "@/components/ui/tooltip";
import {ThemeProvider} from "@wrksz/themes/next";
import {ErrorBoundary} from "@/components/providers/ErrorBoundary";
import {Toaster} from "sonner";
import React from "react";
import {viewport} from "@/config/metadata";
import {JsonLd} from "@/components/seo/json-ld";

export {viewport};

export const metadata: Metadata = {
    metadataBase: new URL("https://hub-nav.ale160.com"),
};

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "hub-nav",
    alternateName: ["hub-nav 浏览器导航", "hub-nav start page"],
    url: "https://hub-nav.ale160.com/",
    inLanguage: ["en", "zh-CN"],
    description:
        "A beautiful OS-style browser homepage with drag-and-drop, folders, dark mode, custom wallpapers, and multi-page management. 100% local, privacy-focused.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full overflow-hidden antialiased" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://ale160.com"/>
        </head>
        <body className="h-full overflow-hidden font-sans">
        <JsonLd data={websiteJsonLd}/>
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
        <Toaster position="top-center" richColors/>
        </body>
        </html>
    );
}
