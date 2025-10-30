"use client";

import { useState, useEffect } from "react";
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

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLocationDialog({
  open,
  onOpenChange,
}: CreateLocationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: "",
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
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a location name");
      return;
    }

    setLoading(true);

    try {
      await apiClient.createLocation({
        name: formData.name,
        description: formData.description,
        parentId: formData.parentId || null,
      });

      toast.success("Location created successfully!");
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        parentId: "",
      });

      // Refresh the page to show new location
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create location:", error);
      toast.error(error.message || "Failed to create location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Location</DialogTitle>
            <DialogDescription>
              Add a new storage location to organize your items
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Location name (e.g., Garage, Kitchen)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Location (Optional)</Label>
              <Select
                value={formData.parentId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, parentId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger id="parent">
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top level)</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Create nested locations (e.g., Garage → Tool Shelf)
              </p>
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
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

