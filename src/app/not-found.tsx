import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 · Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-8 text-foreground">
      <div className="flex items-baseline gap-3">
        <h1 className="text-6xl font-bold">404</h1>
        <span className="text-muted-foreground">Page Not Found</span>
      </div>
      <Link
        href="/"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Go Home
      </Link>
    </main>
  );
}
