"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HomeStats } from "@/components/home-stats";
import { HomeRecentItems } from "@/components/home-recent-items";
import { HomeLocations } from "@/components/home-locations";
import { HomeLabels } from "@/components/home-labels";
import { useAuthContext } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAuthenticated, loading, user } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    console.log("🏠 Dashboard auth check:", { loading, isAuthenticated, user: user?.email });
    if (!loading && !isAuthenticated) {
      console.log("⚠️ Not authenticated, redirecting to login");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, user]);

  if (loading) {
    console.log("⏳ Dashboard loading...");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
          <p className="text-sm text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, showing nothing");
    return null;
  }

  console.log("✅ Authenticated, showing dashboard for:", user?.email);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <HomeStats />
          <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
            <HomeRecentItems />
            <HomeLocations />
          </div>
          <HomeLabels />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
