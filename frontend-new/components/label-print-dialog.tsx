"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { Printer, Download, Loader2 } from "lucide-react";
import Image from "next/image";

interface LabelPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "item" | "location" | "asset";
  id: string;
  title?: string;
}

export function LabelPrintDialog({
  open,
  onOpenChange,
  type,
  id,
  title = "Print Label",
}: LabelPrintDialogProps) {
  const [printing, setPrinting] = useState(false);

  const getLabelUrl = () => {
    switch (type) {
      case "item":
        return apiClient.getItemLabelUrl(id, false);
      case "location":
        return apiClient.getLocationLabelUrl(id, false);
      case "asset":
        return apiClient.getAssetLabelUrl(id, false);
      default:
        return "";
    }
  };

  const handleServerPrint = async () => {
    setPrinting(true);
    try {
      switch (type) {
        case "item":
          await apiClient.printItemLabel(id);
          break;
        case "location":
          await apiClient.printLocationLabel(id);
          break;
        case "asset":
          await apiClient.printAssetLabel(id);
          break;
      }
      toast.success("Label sent to printer successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to print label:", error);
      toast.error(error.message || "Failed to print label");
    } finally {
      setPrinting(false);
    }
  };

  const handleBrowserPrint = () => {
    const printWindow = window.open(getLabelUrl(), "_blank");
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast.error("Failed to open print window. Please check your popup blocker.");
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `label-${id}.png`;
    link.href = getLabelUrl();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Label downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preview and print your label. Choose server print (if configured) or browser print.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center my-4">
          <img
            src={getLabelUrl()}
            alt="Label preview"
            className="max-w-full h-auto border rounded"
          />
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={handleBrowserPrint}
            className="w-full sm:w-auto"
          >
            <Printer className="mr-2 h-4 w-4" />
            Browser Print
          </Button>
          <Button
            onClick={handleServerPrint}
            disabled={printing}
            className="w-full sm:w-auto"
          >
            {printing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Server Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

