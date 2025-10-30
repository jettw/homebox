"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Location, type Item } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Edit, Trash2, ArrowLeft, Package, Printer, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";
import { LabelPrintDialog } from "@/components/label-print-dialog";
import Link from "next/link";

export default function LocationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [location, setLocation] = useState<Location | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && locationId) {
      fetchLocation();
      fetchItems();
    }
  }, [isAuthenticated, locationId]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLocation(locationId);
      setLocation(data);
    } catch (error) {
      console.error("Failed to fetch location:", error);
      toast.error("Failed to load location");
      router.push("/locations");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await apiClient.getItems({ 
        pageSize: 100,
        orderBy: "name",
        locations: [locationId]
      });
      setItems(data.items);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${location?.name}"? This will also delete all child locations.`)) {
      return;
    }

    try {
      await apiClient.deleteLocation(locationId);
      toast.success("Location deleted successfully");
      router.push("/locations");
    } catch (error: any) {
      console.error("Failed to delete location:", error);
      toast.error(error.message || "Failed to delete location");
    }
  };

  if (authLoading || loading) {
    return null;
  }

  if (!isAuthenticated || !location) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/locations")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Locations
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPrintDialogOpen(true)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Label
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/location/${locationId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  {location.parent && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Link 
                        href={`/location/${location.parent.id}`}
                        className="hover:underline"
                      >
                        {location.parent.name}
                      </Link>
                      <ChevronRight className="h-3 w-3" />
                      <span>{location.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">{location.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created {new Date(location.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            {location.description && (
              <>
                <Separator />
                <CardContent className="pt-6">
                  <p className="text-base whitespace-pre-wrap">{location.description}</p>
                </CardContent>
              </>
            )}
          </Card>

          {items.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Items in this location ({items.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="group cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => router.push(`/item/${item.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {item.imageId ? (
                          <img
                            src={apiClient.getItemAttachmentUrl(
                              item.id,
                              item.thumbnailId || item.imageId
                            )}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-4 space-y-2">
                        <h3 className="font-semibold group-hover:text-primary line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {location.children && location.children.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Sub-locations ({location.children.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {location.children.map((child) => (
                  <Card
                    key={child.id}
                    className="cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => router.push(`/location/${child.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base">{child.name}</CardTitle>
                          {child.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {child.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (!location.children || location.children.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">No items or sub-locations</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  This location is empty. Add items using the Create button above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
      <LabelPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        type="location"
        id={locationId}
        title={`Print Label for ${location.name}`}
      />
    </SidebarProvider>
  );
}
