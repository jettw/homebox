"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiClient, type Location } from "@/lib/api/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateItemDialog({
  open,
  onOpenChange,
}: CreateItemDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    locationId: "",
    quantity: 1,
  });

  useEffect(() => {
    if (open) {
      fetchLocations();
    }
  }, [open]);

  const fetchLocations = async () => {
    try {
      const data = await apiClient.getLocations();
      setLocations(data);
      if (data.length > 0 && !formData.locationId) {
        setFormData((prev) => ({ ...prev, locationId: data[0].id }));
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      toast.error("Failed to load locations");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }

    if (!formData.locationId) {
      toast.error("Please select a location");
      return;
    }

    setLoading(true);

    try {
      const item = await apiClient.createItem({
        name: formData.name,
        description: formData.description,
        locationId: formData.locationId,
        quantity: formData.quantity,
      });

      toast.success("Item created successfully!");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        locationId: locations.length > 0 ? locations[0].id : "",
        quantity: 1,
      });

      // Navigate to the new item
      router.push(`/item/${item.id}`);
    } catch (error: any) {
      console.error("Failed to create item:", error);
      toast.error(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Item name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) =>
                  setFormData({ ...formData, locationId: value })
                }
              >
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {locations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No locations available. Create a location first.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Optional description"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || locations.length === 0}>
              {loading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

