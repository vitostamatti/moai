"use client";
import type { SetSelect, ParameterSelect } from "@/db/schema";
import React from "react";
import { ParamDefinitionForm } from "../parameter/param-definition-form/param-definition-form";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AIAssistant } from "../ai-chat/ai-assistant";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

type Props = {
  modelId: string;
  sets: SetSelect[];
  initialParam?: ParameterSelect;
};

export const ParameterEditorPage = ({ modelId, sets, initialParam }: Props) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={70}>
        <div className="h-full p-4 flex flex-col">
          <ParamDefinitionForm
            modelId={modelId}
            parameter={initialParam}
            sets={sets}
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

// Fetching wrapper for server-side data into the client editor
export function ParameterEditorSection({
  modelId,
  paramId,
}: {
  modelId: string;
  paramId?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const sets: SetSelect[] = data.sets;
  const initialParam: ParameterSelect | undefined = paramId
    ? data.parameters.find((p) => p.id === paramId)
    : undefined;
  if (paramId && !initialParam)
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Parameter not found
      </div>
    );

  return (
    <ParameterEditorPage
      modelId={modelId}
      sets={sets}
      initialParam={initialParam}
    />
  );
}
