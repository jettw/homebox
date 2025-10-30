"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type Location } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronRight } from "lucide-react";

export function HomeLocations() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await apiClient.getLocations();
        // Filter to only parent locations (no parent)
        const parentLocations = data.filter((loc) => !loc.parent);
        setLocations(parentLocations);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Locations</CardTitle>
          <CardDescription>Organize your items by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storage Locations</CardTitle>
          <CardDescription>Organize your items by location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No locations yet. Create your first location to organize your items.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Storage Locations</CardTitle>
          <CardDescription>Organize your items by location</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/locations")}>
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md"
              onClick={() => router.push(`/location/${location.id}`)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium group-hover:text-primary">
                    {location.name}
                  </p>
                  {location.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  {location.children && location.children.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {location.children.length} sub-location
                      {location.children.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

