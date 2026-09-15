"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LogIn } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-heading font-bold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {error?.message || "An unexpected error occurred while loading this view."}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="outline" className="w-full sm:w-auto">
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/login">
              <LogIn size={16} className="mr-2" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
