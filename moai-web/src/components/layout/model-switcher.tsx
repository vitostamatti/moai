"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, BlocksIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface Model {
  id: string;
  name: string;
  version: number;
  description?: string;
}

interface ModelSwitcherProps {
  models: Model[];
  currentModelId: string;
}

export function ModelSwitcher({ models, currentModelId }: ModelSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const currentModel = models.find((model) => model.id === currentModelId);

  if (!currentModel) {
    return null;
  }

  const handleModelSwitch = (modelId: string) => {
    router.push(`/models/${modelId}`);
  };

  const handleCreateModel = () => {
    // router.push("/models/new");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <BlocksIcon className="size-4" />

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentModel.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  v{currentModel.version.toString()}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Models
            </DropdownMenuLabel>
            {models.map((model, index) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => handleModelSwitch(model.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <BlocksIcon className="size-3.5 shrink-0" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  {model.description && (
                    <span className="text-xs text-muted-foreground truncate">
                      {model.description}
                    </span>
                  )}
                </div>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" onClick={handleCreateModel}>
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">
                Create model
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
