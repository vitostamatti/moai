"use client";
import React from "react";
import {
  CreateSetDefinitionSchema,
  SetDefinition,
} from "@/lib/editor/set/set-schema";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { SetDefinitionForm } from "../sets/set-definition-form/set-definition-form";
import { AIAssistant } from "../ai-chat/ai-assistant";
import { useForm } from "react-hook-form";
import { SetFormData, setFormSchema } from "@/lib/editor/set/set-form-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateUUID } from "@/lib/chat/utils";

import { toast } from "sonner";

interface SetEditorPageProps {
  modelId: string;
  initialSet?: SetDefinition;
}

const mapSetToFormValues = (s: CreateSetDefinitionSchema): SetFormData => {
  const elements = (s.elements || []).map(String);
  const elementType =
    elements.length && !isNaN(Number(elements[0])) ? "number" : "string";
  return {
    name: s.name || "",
    description: s.description || "",
    elementType,
    elements,
  };
};

export const SetEditorPage = ({ initialSet, modelId }: SetEditorPageProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createSetMutation = useMutation(trpc.sets.create.mutationOptions());
  const updateSetMutation = useMutation(trpc.sets.update.mutationOptions());

  const form = useForm<SetFormData>({
    resolver: zodResolver(setFormSchema),
    defaultValues: {
      name: initialSet?.name || "",
      description: initialSet?.description || "",
      elementType: initialSet?.elements?.length
        ? typeof initialSet.elements[0] === "string"
          ? "string"
          : "number"
        : "string",
      elements:
        initialSet?.elements?.map((el: string | number) => String(el)) || [],
      isDraft: initialSet ? initialSet.isDraft : true,
    },
  });

  // called by Chat when a tool returns a new set (one-shot)
  const handleSetToolCall = React.useCallback(
    (set: CreateSetDefinitionSchema) => {
      const values = mapSetToFormValues(set);
      // only reset values that are not undefined in the tool call
      const currentValues = form.getValues();
      const mergedValues = { ...currentValues, ...values };
      form.reset(mergedValues);
    },
    [form]
  );
  const handleOnSubmit = (data: SetFormData) => {
    // Convert elements to the appropriate type based on elementType
    const finalElements =
      data.elementType === "number"
        ? data.elements.map((e) => parseFloat(e)).filter((n) => !isNaN(n))
        : data.elements;

    const set: SetDefinition = {
      id: initialSet?.id || generateUUID(),
      name: data.name,
      description: data.description || undefined,
      elements: finalElements,
      isDraft: data.isDraft !== undefined ? data.isDraft : true,
    };
    if (initialSet) {
      updateSetMutation.mutate(
        { ...set },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(
              trpc.models.detail.queryOptions({ id: modelId })
            );
            toast.success("Set updated successfully");
          },
        }
      );
    } else {
      createSetMutation.mutate(
        {
          ...set,
          modelId: modelId,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries(
              trpc.models.detail.queryOptions({ id: modelId })
            );
            toast.success("Set draft saved successfully");
          },
        }
      );
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={70}>
        <div className="h-full p-4 flex flex-col">
          <SetDefinitionForm
            form={form}
            onSubmit={handleOnSubmit}
            initialSet={initialSet}
          />
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={15} className="h-full">
        <div className="flex flex-col h-full mx-auto p-4">
          <AIAssistant onSetToolCall={handleSetToolCall} />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
