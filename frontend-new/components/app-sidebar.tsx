"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconBox,
  IconDashboard,
  IconFolder,
  IconTag,
  IconTool,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/components/auth-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Items",
      url: "/items",
      icon: IconBox,
    },
    {
      title: "Locations",
      url: "/locations",
      icon: IconFolder,
    },
    {
      title: "Labels",
      url: "/labels",
      icon: IconTag,
    },
    {
      title: "Maintenance",
      url: "/maintenance",
      icon: IconTool,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconBox className="!size-5" />
                <span className="text-base font-semibold">HomeBox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser
            user={{
              name: user.name || "User",
              email: user.email || "user@example.com",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

