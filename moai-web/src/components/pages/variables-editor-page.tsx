"use client";
import React from "react";
import type { SetSelect, VariableSelect } from "@/db/schema";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AIAssistant } from "../ai-chat/ai-assistant";
import { VariableDefinitionForm } from "../variables/variable-definition-form/variable-definition-form";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface VariablesEditorPageProps {
  modelId: string;
  variable?: VariableSelect;
  initialSets?: SetSelect[];
}

export const VariablesEditorPage = ({
  modelId,
  initialSets = [],
  variable,
}: VariablesEditorPageProps) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={70}>
        <div className="h-full p-4 flex flex-col">
          <VariableDefinitionForm
            modelId={modelId}
            sets={initialSets}
            variable={variable}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={15} className="h-full">
        <div className="flex flex-col h-full mx-auto p-4">
          <AIAssistant />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

// Fetching wrapper colocated with the editor UI to mirror the list page structure
export function VariableEditorSection({
  modelId,
  varId,
}: {
  modelId: string;
  varId?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const sets: SetSelect[] = data.sets;

  const variable: VariableSelect | undefined = varId
    ? data.variables.find((v) => v.id === varId)
    : undefined;
  if (varId && !variable) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Variable not found
      </div>
    );
  }

  return (
    <VariablesEditorPage
      modelId={modelId}
      initialSets={sets}
      variable={variable}
    />
  );
}
