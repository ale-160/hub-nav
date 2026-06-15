import "./globals.css";
import {TooltipProvider} from "@/components/ui/tooltip";
import {ThemeProvider} from "@wrksz/themes/next";
import {ErrorBoundary} from "@/components/providers/ErrorBoundary";
import {Toaster} from "sonner";
import React from "react";
import {viewport} from "@/config/metadata";

export {viewport};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="h-full overflow-hidden antialiased" suppressHydrationWarning>
        <head>
            <link rel="preconnect" href="https://ale160.com"/>
            <title></title>
        </head>
        <body className="h-full overflow-hidden font-sans">
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
