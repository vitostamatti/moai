"use client";
import React from "react";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { SetSelect } from "@/db/schema";
import { SetEditorPage } from "./set-editor-page";

export function SetEditorSection({
  modelId,
  setId,
}: {
  modelId: string;
  setId?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const sets: SetSelect[] = data.sets;
  const rawSet: SetSelect | undefined = setId
    ? sets.find((s) => s.id === setId)
    : undefined;
  const set = rawSet
    ? {
        ...rawSet,
        description: rawSet.description ?? undefined,
      }
    : undefined;

  if (setId && !set) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Set not found</div>
    );
  }

  return <SetEditorPage initialSet={set} modelId={modelId} />;
}
