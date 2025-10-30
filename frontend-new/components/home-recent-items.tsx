"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type Item } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MapPin, ChevronRight } from "lucide-react";

export function HomeRecentItems() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await apiClient.getItems({ page: 1, pageSize: 5, orderBy: "createdAt" });
        setItems(data.items);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
          <CardDescription>Your most recent items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 animate-pulse rounded-md bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted"></div>
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recently Added</CardTitle>
          <CardDescription>Your most recent items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No items yet. Create your first item to get started.
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
          <CardTitle>Recently Added</CardTitle>
          <CardDescription>Your most recent items</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/items")}>
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex cursor-pointer items-center space-x-4 rounded-lg p-2 transition-colors hover:bg-muted"
              onClick={() => router.push(`/item/${item.id}`)}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                )}
                {item.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="mr-1 h-3 w-3" />
                    {item.location.name}
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Qty: {item.quantity}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

