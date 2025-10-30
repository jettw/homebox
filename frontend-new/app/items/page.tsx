"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Item } from "@/lib/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, MapPin, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";
import { LabelPrintDialog } from "@/components/label-print-dialog";

export default function ItemsPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedItemForPrint, setSelectedItemForPrint] = useState<Item | null>(null);
  const pageSize = 24;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated, page]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getItems({ 
        page, 
        pageSize, 
        orderBy: "createdAt" 
      });
      setItems(data.items);
      setTotalPages(Math.ceil(data.total / pageSize));
    } catch (error) {
      console.error("Failed to fetch items:", error);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold tracking-tight">Items</h1>
              <p className="text-muted-foreground">
                Browse and search your inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="aspect-square w-full animate-pulse rounded-lg bg-muted"></div>
                    <div className="mt-4 space-y-2">
                      <div className="h-5 w-3/4 animate-pulse rounded bg-muted"></div>
                      <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-semibold">
                  {searchQuery ? "No items found" : "No items yet"}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Create your first item using the Create button above"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <Card
                    key={item.id}
                    className="group cursor-pointer transition-all hover:shadow-lg relative"
                    onClick={() => router.push(`/item/${item.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden relative">
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
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemForPrint(item);
                            setPrintDialogOpen(true);
                          }}
                          title="Print label"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
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
                          {item.location && (
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="mr-1 h-3 w-3" />
                              <span className="line-clamp-1">{item.location.name}</span>
                            </div>
                          )}
                          <span className="text-muted-foreground ml-auto">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        {item.assetId && (
                          <div className="text-xs text-muted-foreground">
                            #{item.assetId}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
      {selectedItemForPrint && (
        <LabelPrintDialog
          open={printDialogOpen}
          onOpenChange={(open) => {
            setPrintDialogOpen(open);
            if (!open) setSelectedItemForPrint(null);
          }}
          type="item"
          id={selectedItemForPrint.id}
          title={`Print Label for ${selectedItemForPrint.name}`}
        />
      )}
    </SidebarProvider>
  );
}
