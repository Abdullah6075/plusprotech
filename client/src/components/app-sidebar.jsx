import * as React from "react";
import {
  LayoutDashboard,
  School,
  GraduationCap,
  Presentation,
  User,
  UserCheck,
  BookOpen,
  NotebookPen,
  Calendar,
  Clock2,
  CreditCard,
  Headset,
  Medal,
  MessageCircle,
} from "lucide-react";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";

const getNavLinksByRole = (role) => {
  if (role === "admin") {
    return [
      {
        name: "Category",
        url: "/dashboard/category",
        icon: LayoutDashboard,
      },
    ];
  }
  return [];
};

export function AppSidebar({ ...props }) {


  const navlinks = getNavLinksByRole("admin");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-8 shrink-0 overflow-hidden p-1 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <img
              src="https://webfilesstorageaccount.blob.core.windows.net/careers/dwtclogo.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">PlusProtech</span>
            <span className="truncate text-xs text-gray-500">
              Dashboard
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={navlinks} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
