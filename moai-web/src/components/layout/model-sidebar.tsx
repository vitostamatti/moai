"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Database,
  Variable,
  Target,
  CheckSquare,
  BarChart3,
  Activity,
  PlayIcon,
  SettingsIcon,
} from "lucide-react";
import type { ModelWithComponents } from "@/db/types";
import { ModelSwitcher } from "@/components/layout/model-switcher";
import { Breadcrumbs, ModelNav } from "./model-nav";
import { Button } from "@/components/ui/button";

interface ModelSidebarProps {
  model: ModelWithComponents;
  models: Array<{
    id: string;
    name: string;
    version: number;
    description?: string;
  }>;
}

export function ModelSidebar({ model, models }: ModelSidebarProps) {
  const pathname = usePathname();
  const modelId = model.id;
  const sidebarItems = [
    {
      name: "Overview",
      href: `/models/${modelId}`,
      icon: Activity,
    },
    {
      name: "Sets",
      href: `/models/${modelId}/sets`,
      icon: Database,
      count: model.sets.length,
    },
    {
      name: "Parameters",
      href: `/models/${modelId}/parameters`,
      icon: BarChart3,
      count: model.parameters.length,
    },
    {
      name: "Variables",
      href: `/models/${modelId}/variables`,
      icon: Variable,
      count: model.variables.length,
    },
    {
      name: "Constraints",
      href: `/models/${modelId}/constraints`,
      icon: CheckSquare,
      count: model.constraints.length,
    },
    {
      name: "Objective",
      href: `/models/${modelId}/objective`,
      icon: Target,
      status:
        model.objectives.find((o) => o.enabled) ?? model.objectives[0]
          ? (model.objectives.find((o) => o.enabled) ?? model.objectives[0])!
              .type
          : "none",
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="bg-background">
      <SidebarHeader className="p-4 border-b">
        <ModelSwitcher models={models} currentModelId={modelId} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Model Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <item.icon className="h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                        <span>{item.name}</span>
                        {item.count !== undefined && (
                          <SidebarMenuBadge>{item.count}</SidebarMenuBadge>
                        )}
                        {item.status && (
                          <SidebarMenuBadge>{item.status}</SidebarMenuBadge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface ModelLayoutWithSidebarProps {
  model: ModelWithComponents;
  children: React.ReactNode;
  models: Array<{
    id: string;
    name: string;
    version: number;
    description?: string;
  }>;
  breadcrumbs?: Breadcrumbs[];
}

export function ModelLayoutWithSidebar({
  model,
  children,
  models,
  breadcrumbs,
}: ModelLayoutWithSidebarProps) {
  return (
    <div className="flex w-full h-screen bg-background">
      <ModelSidebar model={model} models={models} />
      <SidebarInset className="flex-1 h-full flex flex-col">
        <header className="flex h-12 shrink-0 bg-background z-10 sticky top-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger className="-ml-1" />
            <ModelNav breadcrumbs={breadcrumbs ?? []} />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <PlayIcon className="h-4 w-4 mr-2" />
              Solve
            </Button>
            <Button variant="ghost" size="sm">
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="flex-1 min-h-0">{children}</div>
      </SidebarInset>
    </div>
  );
}
