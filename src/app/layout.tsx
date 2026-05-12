import type { Metadata } from "next";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@wrksz/themes/next";
import { ErrorBoundary } from "@/components/providers/ErrorBoundary";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "hub-nav",
  description: "hub-nav Open Source",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ErrorBoundary language="zh">
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
