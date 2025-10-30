"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { apiClient, type Item, type Location, type Label } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Tag, Edit, Trash2, ArrowLeft, Save, X, Upload, Image as ImageIcon, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuthContext } from "@/components/auth-provider";
import { LabelPrintDialog } from "@/components/label-print-dialog";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    locationId: "",
    quantity: 1,
    serialNumber: "",
    modelNumber: "",
    manufacturer: "",
    insured: false,
    archived: false,
    purchasePrice: 0,
    purchaseTime: "",
    purchaseFrom: "",
    lifetimeWarranty: false,
    warrantyExpires: "",
    warrantyDetails: "",
    soldTime: "",
    soldTo: "",
    soldPrice: 0,
    soldNotes: "",
    notes: "",
    labelIds: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && itemId) {
      fetchItem();
      fetchLocations();
      fetchLabels();
    }
  }, [isAuthenticated, itemId]);

  // Debug logging
  useEffect(() => {
    if (item) {
      console.log("📦 Item loaded:", item);
      console.log("📷 Attachments:", item.attachments);
      const photos = item.attachments?.filter(a => a.type === "photo") || [];
      console.log("📸 Photos filtered:", photos);
      if (photos.length > 0) {
        console.log("🖼️ First photo URL:", apiClient.getItemAttachmentUrl(itemId, photos[0].id));
      }
    }
  }, [item, itemId]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getItem(itemId);
      setItem(data);
      setFormData({
        name: data.name,
        description: data.description || "",
        locationId: data.location?.id || "",
        quantity: data.quantity,
        serialNumber: data.serialNumber || "",
        modelNumber: data.modelNumber || "",
        manufacturer: data.manufacturer || "",
        insured: data.insured || false,
        archived: data.archived || false,
        purchasePrice: data.purchasePrice || 0,
        purchaseTime: data.purchaseTime || "",
        purchaseFrom: data.purchaseFrom || "",
        lifetimeWarranty: data.lifetimeWarranty || false,
        warrantyExpires: data.warrantyExpires || "",
        warrantyDetails: data.warrantyDetails || "",
        soldTime: data.soldTime || "",
        soldTo: data.soldTo || "",
        soldPrice: data.soldPrice || 0,
        soldNotes: data.soldNotes || "",
        notes: data.notes || "",
        labelIds: data.labels?.map(l => l.id) || [],
      });
    } catch (error) {
      console.error("Failed to fetch item:", error);
      toast.error("Failed to load item");
      router.push("/items");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await apiClient.getLocations();
      setLocations(data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const fetchLabels = async () => {
    try {
      const data = await apiClient.getLabels();
      setLabels(data);
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Item name is required");
      return;
    }

    if (!formData.locationId) {
      toast.error("Location is required");
      return;
    }

    try {
      await apiClient.updateItem(itemId, formData);
      toast.success("Item updated successfully");
      setEditing(false);
      fetchItem();
    } catch (error: any) {
      console.error("Failed to update item:", error);
      toast.error(error.message || "Failed to update item");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item?.name}"?`)) {
      return;
    }

    try {
      await apiClient.deleteItem(itemId);
      toast.success("Item deleted successfully");
      router.push("/items");
    } catch (error: any) {
      console.error("Failed to delete item:", error);
      toast.error(error.message || "Failed to delete item");
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        locationId: item.location?.id || "",
        quantity: item.quantity,
        serialNumber: item.serialNumber || "",
        modelNumber: item.modelNumber || "",
        manufacturer: item.manufacturer || "",
        insured: item.insured || false,
        archived: item.archived || false,
        purchasePrice: item.purchasePrice || 0,
        purchaseTime: item.purchaseTime || "",
        purchaseFrom: item.purchaseFrom || "",
        lifetimeWarranty: item.lifetimeWarranty || false,
        warrantyExpires: item.warrantyExpires || "",
        warrantyDetails: item.warrantyDetails || "",
        soldTime: item.soldTime || "",
        soldTo: item.soldTo || "",
        soldPrice: item.soldPrice || 0,
        soldNotes: item.soldNotes || "",
        notes: item.notes || "",
        labelIds: item.labels?.map(l => l.id) || [],
      });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      await apiClient.uploadItemAttachment(itemId, file, "photo", item?.attachments?.length === 0);
      toast.success("Photo uploaded successfully");
      fetchItem();
    } catch (error: any) {
      console.error("Failed to upload photo:", error);
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (attachmentId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      await apiClient.deleteItemAttachment(itemId, attachmentId);
      toast.success("Photo deleted successfully");
      fetchItem();
    } catch (error: any) {
      console.error("Failed to delete photo:", error);
      toast.error(error.message || "Failed to delete photo");
    }
  };

  if (authLoading || loading) {
    return null;
  }

  if (!isAuthenticated || !item) {
    return null;
  }

  const photos = item.attachments?.filter(a => a.type === "photo") || [];

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/items")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Items
            </Button>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setPrintDialogOpen(true)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Label
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="purchase">Purchase</TabsTrigger>
                  <TabsTrigger value="warranty">Warranty</TabsTrigger>
                  <TabsTrigger value="sold">Sold</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <UILabel htmlFor="name">Name *</UILabel>
                        {editing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        ) : (
                          <p className="text-lg font-semibold">{item.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel htmlFor="description">Description</UILabel>
                        {editing ? (
                          <Textarea
                            id="description"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          />
                        ) : (
                          <p className="text-muted-foreground">{item.description || "No description"}</p>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <UILabel htmlFor="location">Location *</UILabel>
                          {editing ? (
                            <Select
                              value={formData.locationId}
                              onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                            >
                              <SelectTrigger id="location">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem key={location.id} value={location.id}>
                                    {location.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : item.location ? (
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => router.push(`/location/${item.location!.id}`)}
                            >
                              <MapPin className="mr-2 h-4 w-4" />
                              {item.location.name}
                            </Button>
                          ) : (
                            <p className="text-muted-foreground">No location</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <UILabel htmlFor="quantity">Quantity</UILabel>
                          {editing ? (
                            <Input
                              id="quantity"
                              type="number"
                              min="1"
                              value={formData.quantity}
                              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                            />
                          ) : (
                            <p className="text-lg font-semibold">{item.quantity}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <UILabel>Serial Number</UILabel>
                        {editing ? (
                          <Input
                            value={formData.serialNumber}
                            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">{item.serialNumber || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Model Number</UILabel>
                        {editing ? (
                          <Input
                            value={formData.modelNumber}
                            onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">{item.modelNumber || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Manufacturer</UILabel>
                        {editing ? (
                          <Input
                            value={formData.manufacturer}
                            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">{item.manufacturer || "Not set"}</p>
                        )}
                      </div>

                      {editing && (
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="insured"
                              checked={formData.insured}
                              onCheckedChange={(checked) => setFormData({ ...formData, insured: checked as boolean })}
                            />
                            <UILabel htmlFor="insured">Insured</UILabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="archived"
                              checked={formData.archived}
                              onCheckedChange={(checked) => setFormData({ ...formData, archived: checked as boolean })}
                            />
                            <UILabel htmlFor="archived">Archived</UILabel>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <UILabel htmlFor="notes">Notes</UILabel>
                        {editing ? (
                          <Textarea
                            id="notes"
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Additional notes about this item"
                          />
                        ) : (
                          <p className="text-muted-foreground">{item.notes || "No notes"}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="purchase" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Purchase Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <UILabel>Purchase Price</UILabel>
                        {editing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.purchasePrice}
                            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                          />
                        ) : (
                          <p className="text-lg font-semibold">
                            ${item.purchasePrice?.toFixed(2) || "0.00"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Purchase Date</UILabel>
                        {editing ? (
                          <Input
                            type="date"
                            value={formData.purchaseTime}
                            onChange={(e) => setFormData({ ...formData, purchaseTime: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">
                            {item.purchaseTime ? new Date(item.purchaseTime).toLocaleDateString() : "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Purchased From</UILabel>
                        {editing ? (
                          <Input
                            value={formData.purchaseFrom}
                            onChange={(e) => setFormData({ ...formData, purchaseFrom: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">{item.purchaseFrom || "Not set"}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="warranty" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Warranty Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {editing && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="lifetimeWarranty"
                            checked={formData.lifetimeWarranty}
                            onCheckedChange={(checked) => setFormData({ ...formData, lifetimeWarranty: checked as boolean })}
                          />
                          <UILabel htmlFor="lifetimeWarranty">Lifetime Warranty</UILabel>
                        </div>
                      )}

                      <div className="space-y-2">
                        <UILabel>Warranty Expires</UILabel>
                        {editing ? (
                          <Input
                            type="date"
                            value={formData.warrantyExpires}
                            onChange={(e) => setFormData({ ...formData, warrantyExpires: e.target.value })}
                            disabled={formData.lifetimeWarranty}
                          />
                        ) : (
                          <p className="text-sm">
                            {item.lifetimeWarranty ? "Lifetime Warranty" : 
                             item.warrantyExpires ? new Date(item.warrantyExpires).toLocaleDateString() : "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Warranty Details</UILabel>
                        {editing ? (
                          <Textarea
                            rows={4}
                            value={formData.warrantyDetails}
                            onChange={(e) => setFormData({ ...formData, warrantyDetails: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{item.warrantyDetails || "No details"}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sold" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sale Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <UILabel>Sold Price</UILabel>
                        {editing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={formData.soldPrice}
                            onChange={(e) => setFormData({ ...formData, soldPrice: parseFloat(e.target.value) || 0 })}
                          />
                        ) : (
                          <p className="text-lg font-semibold">
                            {item.soldPrice ? `$${item.soldPrice.toFixed(2)}` : "Not sold"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Sold Date</UILabel>
                        {editing ? (
                          <Input
                            type="date"
                            value={formData.soldTime}
                            onChange={(e) => setFormData({ ...formData, soldTime: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">
                            {item.soldTime ? new Date(item.soldTime).toLocaleDateString() : "Not set"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Sold To</UILabel>
                        {editing ? (
                          <Input
                            value={formData.soldTo}
                            onChange={(e) => setFormData({ ...formData, soldTo: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm">{item.soldTo || "Not set"}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UILabel>Sale Notes</UILabel>
                        {editing ? (
                          <Textarea
                            rows={4}
                            value={formData.soldNotes}
                            onChange={(e) => setFormData({ ...formData, soldNotes: e.target.value })}
                          />
                        ) : (
                          <p className="text-sm text-muted-foreground">{item.soldNotes || "No notes"}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <CardDescription>Upload photos of this item</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {photos.length > 0 ? (
                    <div className="space-y-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={apiClient.getItemAttachmentUrl(itemId, photo.id)}
                            alt="Item photo"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {photo.primary && (
                            <Badge className="absolute bottom-2 left-2">Primary</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                      <p className="text-sm">No photos yet</p>
                    </div>
                  )}

                  <div className="relative">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={uploadingPhoto}
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </Button>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <UILabel>Asset ID</UILabel>
                    <p className="font-mono">{item.assetId}</p>
                  </div>
                  {item.insured && (
                    <div>
                      <Badge variant="secondary">Insured</Badge>
                    </div>
                  )}
                  {item.archived && (
                    <div>
                      <Badge variant="outline">Archived</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {item.labels && item.labels.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Labels</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.labels.map((label) => (
                        <Badge key={label.id} variant="secondary">
                          <Tag className="mr-1 h-3 w-3" />
                          {label.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <UILabel>Created</UILabel>
                    <p className="text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <UILabel>Updated</UILabel>
                    <p className="text-muted-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
      <LabelPrintDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        type="item"
        id={itemId}
        title={`Print Label for ${item.name}`}
      />
    </SidebarProvider>
  );
}
