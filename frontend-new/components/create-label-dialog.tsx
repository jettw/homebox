"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
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
import { toast } from "sonner";

interface CreateLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLabelDialog({
  open,
  onOpenChange,
}: CreateLabelDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a label name");
      return;
    }

    setLoading(true);

    try {
      await apiClient.createLabel({
        name: formData.name,
        description: formData.description,
        color: formData.color || undefined,
      });

      toast.success("Label created successfully!");
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        description: "",
        color: "",
      });

      // Refresh the page to show new label
      window.location.reload();
    } catch (error: any) {
      console.error("Failed to create label:", error);
      toast.error(error.message || "Failed to create label");
    } finally {
      setLoading(false);
    }
  };

  const presetColors = [
    "#ef4444", // red
    "#f59e0b", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280", // gray
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Label</DialogTitle>
            <DialogDescription>
              Add a new label to categorize your items
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="Label name (e.g., Electronics, Tools)"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Color (Optional)</Label>
              <div className="flex gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={formData.color || "#000000"}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="h-8 w-20 cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Custom color
                </span>
              </div>
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
              {loading ? "Creating..." : "Create Label"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

