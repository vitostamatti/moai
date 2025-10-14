"use client";
import React from "react";
import { useForm } from "react-hook-form";
import type { VariableInserts, VariableSelect, SetSelect } from "@/db/schema";
import { Form } from "@/components/ui/form";
import {
  NameField,
  DescriptionField,
  DomainField,
  BoundsFields,
  IndexSetsField,
  FormActions,
} from "./form-fields";
import type { VariableFormData } from "./types";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface VariableDefinitionFormProps {
  modelId: string;
  onCancel?: () => void;
  variable?: VariableSelect;
  sets: SetSelect[];
  onSubmit?: (variable: VariableInserts) => void;
}

export const VariableDefinitionForm: React.FC<VariableDefinitionFormProps> = ({
  modelId,
  onCancel,
  variable,
  sets,
  onSubmit,
}) => {
  const isEditing = !!variable;
  const trpc = useTRPC();
  const qc = useQueryClient();

  const invalidateModelCaches = async () => {
    await Promise.all([
      qc.invalidateQueries(trpc.models.detail.queryFilter({ id: modelId })),
      qc.invalidateQueries(trpc.models.list.queryFilter()),
    ]);
  };

  const createMutation = useMutation(
    trpc.variables.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Variable created");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to create variable"
        ),
    })
  );

  const updateMutation = useMutation(
    trpc.variables.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Variable updated");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to update variable"
        ),
    })
  );

  const form = useForm<VariableFormData>({
    defaultValues: {
      name: "",
      description: "",
      domain: "Reals",
      lowerBound: "",
      upperBound: "",
      indices: [],
    },
  });

  React.useEffect(() => {
    if (variable) {
      form.reset({
        name: variable.name,
        description: variable.description || "",
        domain: variable.domain,
        lowerBound:
          variable.lowerBound !== undefined && variable.lowerBound !== null
            ? String(variable.lowerBound)
            : "",
        upperBound:
          variable.upperBound !== undefined && variable.upperBound !== null
            ? String(variable.upperBound)
            : "",
        indices: variable.indices ?? [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        domain: "Reals",
        lowerBound: "",
        upperBound: "",
        indices: [],
      });
    }
  }, [variable, form]);

  const handleSubmit = (data: VariableFormData) => {
    const lower =
      data.lowerBound && data.lowerBound !== ""
        ? parseFloat(data.lowerBound)
        : undefined;
    const upper =
      data.upperBound && data.upperBound !== ""
        ? parseFloat(data.upperBound)
        : undefined;

    const payload: VariableInserts = {
      id: variable?.id ?? crypto.randomUUID(),
      modelId,
      name: data.name,
      description: data.description || null,
      domain: data.domain,
      lowerBound: lower,
      upperBound: upper,
      indices: data.indices && data.indices.length > 0 ? data.indices : null,
      createdAt: variable?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    if (isEditing && variable) {
      updateMutation.mutate({
        id: variable.id,
        name: payload.name,
        description: payload.description,
        domain: payload.domain,
        lowerBound: payload.lowerBound ?? undefined,
        upperBound: payload.upperBound ?? undefined,
        indices: payload.indices ?? undefined,
      });
    } else {
      createMutation.mutate({
        modelId: modelId,
        name: payload.name,
        description: payload.description,
        domain: payload.domain,
        lowerBound: payload.lowerBound ?? undefined,
        upperBound: payload.upperBound ?? undefined,
        indices: payload.indices ?? undefined,
      });
    }

    onSubmit?.(payload);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Card className="h-full flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <CardHeader className="shrink-0">
            <CardTitle>Variable Editor</CardTitle>
            <CardDescription>
              Configure the properties and elements of your variable.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <NameField form={form} />
              <DomainField form={form} />
            </div>

            <DescriptionField form={form} />

            <BoundsFields form={form} />

            <IndexSetsField form={form} sets={sets} />
          </CardContent>
          <CardFooter className=" flex justify-end gap-2">
            <FormActions isEditing={isEditing} onCancel={handleCancel} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
