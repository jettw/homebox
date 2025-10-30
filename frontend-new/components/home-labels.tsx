"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type Label } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, ChevronRight } from "lucide-react";

export function HomeLabels() {
  const router = useRouter();
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const data = await apiClient.getLabels();
        setLabels(data);
      } catch (error) {
        console.error("Failed to fetch labels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
          <CardDescription>Categorize and filter your items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 animate-pulse rounded-full bg-muted"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Labels</CardTitle>
          <CardDescription>Categorize and filter your items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No labels yet. Create your first label to categorize your items.
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
          <CardTitle>Labels</CardTitle>
          <CardDescription>Categorize and filter your items</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/labels")}>
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Badge
              key={label.id}
              variant="secondary"
              className="cursor-pointer px-3 py-1 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => router.push(`/label/${label.id}`)}
            >
              <Tag className="mr-1 h-3 w-3" />
              {label.name}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

