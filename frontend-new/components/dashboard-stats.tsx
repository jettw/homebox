"use client";

import { useEffect, useState } from "react";
import { IconBox, IconTag, IconMapPin, IconCurrencyDollar } from "@tabler/icons-react";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { statsApi, type GroupStatistics } from "@/lib/api/items";

export function DashboardStats() {
  const [stats, setStats] = useState<GroupStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await statsApi.getGroupStatistics();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-8 w-32 rounded bg-muted" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBox className="h-4 w-4" />
            Total Items
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalItems.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Items in your inventory
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconMapPin className="h-4 w-4" />
            Locations
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalLocations.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Storage locations
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconTag className="h-4 w-4" />
            Labels
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalLabels.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Organization labels
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCurrencyDollar className="h-4 w-4" />
            Total Value
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats.totalItemPrice)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          Total inventory value
        </CardFooter>
      </Card>
    </div>
  );
}

