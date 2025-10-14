import React, { useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ParameterSelect, ParameterInserts, SetSelect } from "@/db/schema";
import type { IndexedParamValue } from "@/lib/editor/param/param-schema";
import {
  paramDefinitionFormSchema,
  ParamDefinitionFormSchema,
} from "@/lib/editor/param/param-form-schema";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  NameField,
  DescriptionField,
  IndicesField,
  ValueTypeField,
  ScalarValueField,
  IndexedValuesField,
  FormActions,
} from "./form-fields";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ParamDefinitionFormProps {
  modelId: string;
  parameter?: ParameterSelect;
  sets: SetSelect[];
  onSubmit?: (param: ParameterInserts) => void;
  onCancel?: () => void;
}

export const ParamDefinitionForm = ({
  modelId,
  parameter,
  sets,
  onSubmit,
  onCancel,
}: ParamDefinitionFormProps) => {
  const isEditing = !!parameter;
  const trpc = useTRPC();
  const qc = useQueryClient();

  const invalidateModelCaches = async () => {
    await Promise.all([
      qc.invalidateQueries(trpc.models.detail.queryFilter({ id: modelId })),
      qc.invalidateQueries(trpc.models.list.queryFilter()),
    ]);
  };

  const createMutation = useMutation(
    trpc.parameters.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Parameter created");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to create parameter"
        ),
    })
  );

  const updateMutation = useMutation(
    trpc.parameters.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Parameter updated");
        await invalidateModelCaches();
      },
      onError: (e) =>
        toast.error(
          (e as { message?: string })?.message ?? "Failed to update parameter"
        ),
    })
  );

  // Generate all possible index combinations based on selected indices
  const generateIndexCombinations = useCallback(
    (indices: string[]): string[][] => {
      if (indices.length === 0) return [];

      const selectedSets = indices
        .map((setName) => sets.find((s) => s.name === setName))
        .filter(Boolean) as SetSelect[];

      if (selectedSets.length === 0) return [];
      if (selectedSets.length === 1) {
        return selectedSets[0].elements.map((el) => [String(el)]);
      }

      // Generate cartesian product for multiple sets
      const combinations: string[][] = [];

      const generate = (current: string[], remaining: SetSelect[]) => {
        if (remaining.length === 0) {
          combinations.push([...current]);
          return;
        }

        const [firstSet, ...restSets] = remaining;
        for (const element of firstSet.elements) {
          generate([...current, String(element)], restSets);
        }
      };

      generate([], selectedSets);
      return combinations;
    },
    [sets]
  );

  // Convert ParamDefinition to form data
  const getFormData = (): ParamDefinitionFormSchema => {
    if (parameter) {
      const isScalar =
        typeof parameter.values === "number" ||
        typeof parameter.values === "string";

      return {
        name: parameter.name,
        description: parameter.description || "",
        indices: parameter.indices ?? [],
        valueType: isScalar ? "scalar" : "indexed",
        scalarValue: isScalar ? String(parameter.values) : "",
        indexedValues: isScalar
          ? []
          : (parameter.values as IndexedParamValue[]).map((v) => ({
              index: v.index.map(String),
              value: String(v.value),
            })),
      };
    }

    return {
      name: "",
      description: "",
      indices: [],
      valueType: "scalar" as const,
      scalarValue: "",
      indexedValues: [],
    };
  };

  const form = useForm<ParamDefinitionFormSchema>({
    resolver: zodResolver(paramDefinitionFormSchema),
    defaultValues: getFormData(),
  });

  const { watch, setValue } = form;
  const valueType = watch("valueType");
  const indices = watch("indices");
  const watchedIndexedValues = watch("indexedValues");

  // Memoized indexed values to prevent unnecessary re-renders
  const indexedValues = useMemo(
    () => watchedIndexedValues || [],
    [watchedIndexedValues]
  );

  // Memoized index combinations
  const indexCombinations = useMemo(() => {
    return generateIndexCombinations(indices || []);
  }, [indices, generateIndexCombinations]);

  // Check validation status
  const validationStatus = useMemo(() => {
    if (valueType !== "indexed" || !indices || indices.length === 0) {
      return { isComplete: true, missing: [], total: 0 };
    }

    const requiredCombinations = indexCombinations;
    const definedCombinations = indexedValues.map((v) => v.index);

    const missing = requiredCombinations.filter(
      (combo) =>
        !definedCombinations.some(
          (defined) =>
            defined.length === combo.length &&
            defined.every((val, idx) => val === combo[idx])
        )
    );

    return {
      isComplete: missing.length === 0,
      missing,
      total: requiredCombinations.length,
      defined: definedCombinations.length,
    };
  }, [valueType, indices, indexCombinations, indexedValues]);

  const handleAddIndex = (setName: string) => {
    const currentIndices = indices || [];
    if (!currentIndices.includes(setName)) {
      const newIndices = [...currentIndices, setName];
      setValue("indices", newIndices);

      // Automatically populate all index combinations with default values
      const combinations = generateIndexCombinations(newIndices);
      const newValues = combinations.map((combo) => ({
        index: combo,
        value: "0",
      }));
      setValue("indexedValues", newValues);
    }
  };

  const handleRemoveIndex = (index: number) => {
    const currentIndices = indices || [];
    const newIndices = currentIndices.filter((_, i) => i !== index);
    setValue("indices", newIndices);

    // Repopulate with new combinations
    if (newIndices.length > 0) {
      const combinations = generateIndexCombinations(newIndices);
      const newValues = combinations.map((combo) => ({
        index: combo,
        value: "0",
      }));
      setValue("indexedValues", newValues);
    } else {
      setValue("indexedValues", []);
    }
  };

  // Auto-populate when switching to indexed mode
  const handleValueTypeChange = (newValueType: "scalar" | "indexed") => {
    setValue("valueType", newValueType);

    if (newValueType === "indexed" && indices && indices.length > 0) {
      // Auto-populate all combinations if we have indices
      const combinations = generateIndexCombinations(indices);
      const newValues = combinations.map((combo) => ({
        index: combo,
        value: "0",
      }));
      setValue("indexedValues", newValues);
    }
  };

  const handleUpdateIndexValue = (index: number, newValue: string) => {
    const updated = indexedValues.map((v, i) =>
      i === index ? { ...v, value: newValue } : v
    );
    setValue("indexedValues", updated);
  };

  const handleSubmitForm = (data: ParamDefinitionFormSchema) => {
    let finalValues: number | string | IndexedParamValue[];

    if (data.valueType === "scalar") {
      const numValue = parseFloat(data.scalarValue || "0");
      finalValues = isNaN(numValue) ? data.scalarValue || "" : numValue;
    } else {
      finalValues = (data.indexedValues || []).map((v) => ({
        index: v.index,
        value: parseFloat(v.value),
      }));
    }

    const payload: ParameterInserts = {
      id: parameter?.id ?? crypto.randomUUID(),
      modelId,
      name: data.name,
      description: data.description || "" || null,
      indices: data.indices && data.indices.length > 0 ? data.indices : null,
      values: finalValues,
      createdAt: parameter?.createdAt ?? new Date(),
      updatedAt: new Date(),
      symbol: parameter?.symbol ?? "",
    };

    if (isEditing && parameter) {
      updateMutation.mutate({
        id: parameter.id,
        name: payload.name,
        description: payload.description,
        indices: payload.indices ?? undefined,
        values: payload.values,
      });
    } else {
      createMutation.mutate({
        modelId,
        name: payload.name,
        description: payload.description,
        indices: payload.indices ?? undefined,
        values: payload.values,
      });
    }

    onSubmit?.(payload);
    onCancel?.();
  };

  const handleClose = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Card className="h-full flex flex-col">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmitForm)}
          className="h-full flex flex-col space-y-4"
        >
          <CardHeader className="shrink-0">
            <CardTitle>Parameter Editor</CardTitle>
            <CardDescription>
              {parameter
                ? "Update the parameter definition below."
                : "Define a new parameter for your model."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <NameField form={form} />

            <DescriptionField form={form} />

            <ValueTypeField
              form={form}
              onValueTypeChange={handleValueTypeChange}
            />

            {valueType === "scalar" && <ScalarValueField form={form} />}

            {valueType === "indexed" && (
              <>
                <IndicesField
                  form={form}
                  sets={sets}
                  indices={indices || []}
                  onAddIndex={handleAddIndex}
                  onRemoveIndex={handleRemoveIndex}
                />
                <IndexedValuesField
                  form={form}
                  indices={indices || []}
                  indexedValues={indexedValues}
                  validationStatus={validationStatus}
                  onUpdateIndexValue={handleUpdateIndexValue}
                />
              </>
            )}
          </CardContent>
          <CardFooter className=" flex justify-end gap-2">
            <FormActions parameter={parameter} onCancel={handleClose} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
