"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Label, type Item } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";

export default function LabelDetailPage() {
  const router = useRouter();
  const params = useParams();
  const labelId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [label, setLabel] = useState<Label | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && labelId) {
      fetchLabel();
      fetchItems();
    }
  }, [isAuthenticated, labelId]);

  const fetchLabel = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLabel(labelId);
      setLabel(data);
    } catch (error) {
      console.error("Failed to fetch label:", error);
      toast.error("Failed to load label");
      router.push("/labels");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await apiClient.getItems({ page: 1, pageSize: 100 });
      const filtered = data.items.filter(item => 
        item.labels?.some(l => l.id === labelId)
      );
      setItems(filtered);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  if (authLoading || loading) {
    return null;
  }

  if (!isAuthenticated || !label) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/labels")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Labels
            </Button>
          </div>

          <Card>
            <CardHeader>
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
                <div>
                  <CardTitle className="text-2xl">{label.name}</CardTitle>
                  {label.description && (
                    <p className="mt-2 text-muted-foreground">{label.description}</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-4">Items with this label ({items.length})</h3>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="mx-auto h-12 w-12 mb-2" />
                  <p>No items with this label yet</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                      onClick={() => router.push(`/item/${item.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

