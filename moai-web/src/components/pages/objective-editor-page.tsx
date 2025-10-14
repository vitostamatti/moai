"use client";
import React from "react";
import type { ObjectiveSelect } from "@/db/schema";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AIAssistant } from "../ai-chat/ai-assistant";
import { ObjectiveDefinitionForm } from "../objective/objective-definition-form/objective-definition-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

type Props = {
  modelId: string;
  initialObjective?: ObjectiveSelect;
};

export const ObjectiveEditorPage = ({ modelId, initialObjective }: Props) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={70}>
        <div className="h-full p-4 flex flex-col">
          <ObjectiveDefinitionForm
            modelId={modelId}
            objective={initialObjective}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} className="h-full">
        <div className="flex flex-col h-full mx-auto p-4">
          <AIAssistant />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

// Fetching wrapper colocated with editor UI to mirror the constraint editor structure
export function ObjectiveEditorSection({
  modelId,
  objId,
}: {
  modelId: string;
  objId?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const initialObjective: ObjectiveSelect | undefined = objId
    ? data.objectives.find((o) => o.id === objId)
    : undefined;

  if (objId && !initialObjective) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Objective not found
      </div>
    );
  }

  return (
    <ObjectiveEditorPage
      modelId={modelId}
      initialObjective={initialObjective}
    />
  );
}
