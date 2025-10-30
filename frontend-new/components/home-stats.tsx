"use client";

import { useEffect, useState } from "react";
import { apiClient, type GroupStatistics } from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  MapPin,
  Tag,
  DollarSign,
} from "lucide-react";

export function HomeStats() {
  const [stats, setStats] = useState<GroupStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getGroupStatistics();
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: "Total Value",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(stats.totalItemPrice),
      icon: DollarSign,
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Total Items",
      value: stats.totalItems.toLocaleString(),
      icon: Package,
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Locations",
      value: stats.totalLocations.toLocaleString(),
      icon: MapPin,
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Labels",
      value: stats.totalLabels.toLocaleString(),
      icon: Tag,
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

