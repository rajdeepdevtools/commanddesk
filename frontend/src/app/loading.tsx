import { Loader as Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function Loading() {
  return (
    <DashboardLayout>
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary-indigo" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
