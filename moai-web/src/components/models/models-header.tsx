"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateModelDialog } from "@/stores/create-model-dialog";

export function ModelsHeader() {
  const { openDialog } = useCreateModelDialog();
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Your Models</h1>
        <p className="text-muted-foreground mt-2">
          Manage and edit your optimization models
        </p>
      </div>
      <Button className="flex items-center gap-2" onClick={() => openDialog()}>
        <Plus className="h-4 w-4" />
        New Model
      </Button>
    </div>
  );
}
