"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Package, MapPin, Tag } from "lucide-react";
import { CreateItemDialog } from "./create-item-dialog";
import { CreateLocationDialog } from "./create-location-dialog";
import { CreateLabelDialog } from "./create-label-dialog";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const [createDialogOpen, setCreateDialogOpen] = useState<
    "item" | "location" | "label" | null
  >(null);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">HomeBox</h1>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create New</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen("item")}
                  className="cursor-pointer"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Item
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen("location")}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Location
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setCreateDialogOpen("label")}
                  className="cursor-pointer"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Label
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CreateItemDialog
        open={createDialogOpen === "item"}
        onOpenChange={(open) => setCreateDialogOpen(open ? "item" : null)}
      />
      <CreateLocationDialog
        open={createDialogOpen === "location"}
        onOpenChange={(open) => setCreateDialogOpen(open ? "location" : null)}
      />
      <CreateLabelDialog
        open={createDialogOpen === "label"}
        onOpenChange={(open) => setCreateDialogOpen(open ? "label" : null)}
      />
    </>
  );
}
