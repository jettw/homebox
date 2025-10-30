"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Download, FileSpreadsheet, Tags, QrCode, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";

export default function ToolsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleExport = async (format: "csv" | "json") => {
    try {
      setExporting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7745/api/v1"}/items/export?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${apiClient.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `homebox-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Successfully exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to export:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateLabels = () => {
    router.push("/reports/label-generator");
  };

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const tools = [
    {
      icon: Settings,
      title: "Export Data",
      description: "Export all your items to CSV or JSON format",
      action: (
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport("csv")}
            disabled={exporting}
            variant="outline"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => handleExport("json")}
            disabled={exporting}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      ),
    },
    {
      icon: Tags,
      title: "Label Generator",
      description: "Generate printable labels for your items and locations",
      action: (
        <Button onClick={handleGenerateLabels} variant="outline" disabled>
          <QrCode className="mr-2 h-4 w-4" />
          Generate Labels (Coming Soon)
        </Button>
      ),
    },
    {
      icon: FileSpreadsheet,
      title: "Import Data",
      description: "Import items from a CSV file",
      action: (
        <Button variant="outline" disabled>
          <Download className="mr-2 h-4 w-4 rotate-180" />
          Import CSV (Coming Soon)
        </Button>
      ),
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
            <p className="text-muted-foreground">
              Utilities and tools for managing your inventory
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{tool.action}</CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-orange-500/50">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/10">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription className="mt-1.5">
                    Be careful when importing or exporting data. Always backup your data before making changes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Exports include all items, locations, and labels</p>
                <p>• CSV format is compatible with Excel and Google Sheets</p>
                <p>• JSON format preserves all relationships and metadata</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

