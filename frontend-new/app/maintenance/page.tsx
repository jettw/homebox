"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type MaintenanceEntryWithDetails, MaintenanceFilterStatus } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Package, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";

export default function MaintenancePage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [entries, setEntries] = useState<MaintenanceEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<MaintenanceFilterStatus>(MaintenanceFilterStatus.Scheduled);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMaintenance();
    }
  }, [isAuthenticated, filter]);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAllMaintenance({ status: filter });
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch maintenance:", error);
      toast.error("Failed to load maintenance entries");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const scheduledEntries = entries.filter(e => !e.completedDate);
  const completedEntries = entries.filter(e => e.completedDate);
  const totalCost = entries.reduce((sum, e) => sum + e.cost, 0);

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">
              Track maintenance and service records for your items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={filter === MaintenanceFilterStatus.Scheduled ? "default" : "outline"}
              onClick={() => setFilter(MaintenanceFilterStatus.Scheduled)}
            >
              Scheduled
            </Button>
            <Button
              size="sm"
              variant={filter === MaintenanceFilterStatus.Completed ? "default" : "outline"}
              onClick={() => setFilter(MaintenanceFilterStatus.Completed)}
            >
              Completed
            </Button>
            <Button
              size="sm"
              variant={filter === MaintenanceFilterStatus.Both ? "default" : "outline"}
              onClick={() => setFilter(MaintenanceFilterStatus.Both)}
            >
              Both
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {entries.length} entries • Total: ${totalCost.toFixed(2)}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-muted"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Wrench className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No maintenance records yet</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Maintenance entries can be added from individual item pages
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {scheduledEntries.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Scheduled ({scheduledEntries.length})
                  </h2>
                  <div className="space-y-3">
                    {scheduledEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="cursor-pointer transition-all hover:shadow-lg"
                        onClick={() => router.push(`/item/${entry.itemID}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/10">
                                <Calendar className="h-5 w-5 text-orange-500" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{entry.name}</h3>
                                {entry.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {entry.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {entry.itemName}
                                  </div>
                                  <div>
                                    Due: {new Date(entry.scheduledDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {entry.cost > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                                <p className="font-semibold">
                                  ${entry.cost.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {completedEntries.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Completed ({completedEntries.length})
                  </h2>
                  <div className="space-y-3">
                    {completedEntries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="cursor-pointer transition-all hover:shadow-lg opacity-75"
                        onClick={() => router.push(`/item/${entry.itemID}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-500/10">
                                <Wrench className="h-5 w-5 text-green-500" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{entry.name}</h3>
                                {entry.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {entry.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Package className="h-3 w-3" />
                                    {entry.itemName}
                                  </div>
                                  <div>
                                    Completed: {new Date(entry.completedDate!).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            {entry.cost > 0 && (
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">Cost</p>
                                <p className="font-semibold">
                                  ${entry.cost.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

