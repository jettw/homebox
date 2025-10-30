"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Location } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Trash2, Edit, ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";
import { LabelPrintDialog } from "@/components/label-print-dialog";

export default function LocationsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedLocationForPrint, setSelectedLocationForPrint] = useState<Location | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteLocation(id);
      toast.success("Location deleted successfully");
      fetchLocations();
    } catch (error: any) {
      console.error("Failed to delete location:", error);
      toast.error(error.message || "Failed to delete location");
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Build location tree
  const buildLocationTree = (locs: Location[]) => {
    const parentLocations = locs.filter((loc) => !loc.parent);
    const childMap = new Map<string, Location[]>();

    locs.forEach((loc) => {
      if (loc.parent) {
        const children = childMap.get(loc.parent.id) || [];
        children.push(loc);
        childMap.set(loc.parent.id, children);
      }
    });

    return { parentLocations, childMap };
  };

  const { parentLocations, childMap } = buildLocationTree(filteredLocations);

  const LocationCard = ({ location, level = 0 }: { location: Location; level?: number }) => {
    const children = childMap.get(location.id) || [];
    const hasChildren = children.length > 0;

    return (
      <div className={level > 0 ? "ml-6 mt-2" : ""}>
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${level > 0 ? "border-l-4 border-l-primary/20" : ""}`}
          onClick={() => router.push(`/location/${location.id}`)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{location.name}</CardTitle>
                  {location.description && (
                    <CardDescription className="mt-1.5">
                      {location.description}
                    </CardDescription>
                  )}
                  {hasChildren && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {children.length} sub-location{children.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocationForPrint(location);
                    setPrintDialogOpen(true);
                  }}
                  title="Print label"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(location.id, location.name);
                  }}
                  title="Delete location"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
        {hasChildren && (
          <div className="mt-2 space-y-2">
            {children.map((child) => (
              <LocationCard key={child.id} location={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
              <p className="text-muted-foreground">
                Organize and manage your storage locations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-48 animate-pulse rounded bg-muted"></div>
                    <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredLocations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  {searchQuery ? "No locations found" : "No locations yet"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Create your first location using the Create button above"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {parentLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
      {selectedLocationForPrint && (
        <LabelPrintDialog
          open={printDialogOpen}
          onOpenChange={(open) => {
            setPrintDialogOpen(open);
            if (!open) setSelectedLocationForPrint(null);
          }}
          type="location"
          id={selectedLocationForPrint.id}
          title={`Print Label for ${selectedLocationForPrint.name}`}
        />
      )}
    </SidebarProvider>
  );
}
