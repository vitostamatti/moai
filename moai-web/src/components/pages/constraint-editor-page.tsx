"use client";
import React from "react";
import type { SetSelect, VariableSelect, ConstraintSelect } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { AIAssistant } from "../ai-chat/ai-assistant";
import ConstraintDefinitionForm from "../constraint/constraint-definition-form/constraint-definition-form";

type Props = {
  modelId: string;
  sets: SetSelect[];
  variables: VariableSelect[];
  initialConstraint?: ConstraintSelect;
};

export const ConstraintEditorPage = ({
  modelId,
  sets,
  variables,
  initialConstraint,
}: Props) => {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={70}>
        <div className="h-full p-4 flex flex-col">
          <ConstraintDefinitionForm
            modelId={modelId}
            sets={sets}
            variables={variables}
            constraint={initialConstraint}
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

// Fetching wrapper colocated with editor UI
export function ConstraintEditorSection({
  modelId,
  consId,
}: {
  modelId: string;
  consId?: string;
}) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );

  const sets: SetSelect[] = data.sets;
  const variables: VariableSelect[] = data.variables;
  const initialConstraint: ConstraintSelect | undefined = consId
    ? data.constraints.find((c) => c.id === consId)
    : undefined;

  if (consId && !initialConstraint) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Constraint not found
      </div>
    );
  }

  return (
    <ConstraintEditorPage
      modelId={modelId}
      sets={sets}
      variables={variables}
      initialConstraint={initialConstraint}
    />
  );
}
