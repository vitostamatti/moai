"use client";

import { useTRPC } from "@/trpc/client";
import { Plus } from "lucide-react";
import { useCreateModelDialog } from "@/stores/create-model-dialog";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ModelsListItem } from "./models-list-item";

export function ModelsList() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.models.list.queryOptions());

  const { openDialog } = useCreateModelDialog();

  if (!data?.length)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          // onClick={() => openDialog()}
          className="group h-full rounded-lg border-dashed border-2 border-muted-foreground/30 hover:border-primary transition-colors p-6 text-left flex items-center justify-center"
        >
          <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary">
            <Plus className="h-5 w-5" />
            <span>Create a new model</span>
          </div>
        </button>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        onClick={() => openDialog()}
        className="group h-full rounded-lg border-dashed border-2 border-muted-foreground/30 hover:border-primary transition-colors p-6 text-left flex items-center justify-center"
      >
        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary">
          <Plus className="h-5 w-5" />
          <span>Create a new model</span>
        </div>
      </button>
      {data.map((m) => (
        <ModelsListItem key={m.id} model={m} />
      ))}
    </div>
  );
}
