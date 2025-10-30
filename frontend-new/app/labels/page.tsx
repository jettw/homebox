"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Label } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";

export default function LabelsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLabels();
    }
  }, [isAuthenticated]);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLabels();
      setLabels(data);
    } catch (error) {
      console.error("Failed to fetch labels:", error);
      toast.error("Failed to load labels");
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

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Labels</h1>
            <p className="text-muted-foreground">Categorize and organize your items</p>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
              ))}
            </div>
          ) : labels.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No labels yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first label using the Create button above
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {labels.map((label) => (
                <Card
                  key={label.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => router.push(`/label/${label.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: label.color ? `${label.color}20` : undefined,
                        }}
                      >
                        <Tag
                          className="h-5 w-5"
                          style={{ color: label.color || undefined }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold">{label.name}</h3>
                        {label.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                            {label.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
