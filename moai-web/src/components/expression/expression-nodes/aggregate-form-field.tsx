"use client";

import React from "react";
import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { cloneDefaultExpression } from "@/lib/editor/expression/utils/role-utils";
import type {
  Expression,
  IndexBinding,
} from "@/lib/editor/expression/core/types";
import {
  getNestedFieldPath,
  hasNestedErrors,
} from "@/lib/editor/expression/utils/form-utils";

type AggregateNodeFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
};
// Aggregate Expression Component
export const AggregateNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: AggregateNodeFormFieldProps<T>) => {
  const opFieldPath = getNestedFieldPath(name, "op") as FieldPath<T>;
  const indexBindingPath = getNestedFieldPath(
    name,
    "indexBinding"
  ) as FieldPath<T>;

  const conditionPath = getNestedFieldPath(name, "condition") as FieldPath<T>;
  // bodyPath not needed here; body is edited outside via main node editor
  const { getValues, setValue } = useFormContext<T>();

  const bindings = (getValues(indexBindingPath) as IndexBinding[]) || [];
  const addBinding = () => {
    const next = [...bindings, { index: "<idx>", over: "<set>" }] as PathValue<
      T,
      FieldPath<T>
    >;

    setValue(indexBindingPath, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const updateBinding = (i: number, key: "index" | "over", value: string) => {
    const next = bindings.map((b, idx) =>
      idx === i ? { ...b, [key]: value } : b
    ) as PathValue<T, FieldPath<T>>;
    setValue(indexBindingPath, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };
  const removeBinding = (i: number) => {
    const next = bindings.filter((_, idx) => idx !== i) as PathValue<
      T,
      FieldPath<T>
    >;
    setValue(indexBindingPath, next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => {
        const hasDirectError = !!fieldState.error?.message;
        const hasChildErrors = hasNestedErrors(fieldState.error);

        return (
          <FormItem
            className={cn(
              "border-2 p-3 rounded",
              hasDirectError
                ? "border-red-500 bg-red-50"
                : hasChildErrors
                ? "border-orange-500 bg-orange-50"
                : "border-gray-300 bg-white"
            )}
          >
            {title && (
              <div className="text-xs font-mono text-gray-600 mb-2">
                {title}
              </div>
            )}

            <FormField
              control={control}
              name={opFieldPath}
              render={({ field: opField, fieldState: opFieldState }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-pink-600 font-semibold text-sm">
                    Aggregate Operation
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={(opField.value as string) || "sum"}
                      onValueChange={opField.onChange}
                    >
                      <SelectTrigger
                        className={`w-48 ${
                          opFieldState.error
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sum">sum (Summation)</SelectItem>
                        <SelectItem value="prod">prod (Product)</SelectItem>
                        <SelectItem value="min">min (Minimum)</SelectItem>
                        <SelectItem value="max">max (Maximum)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Index Bindings */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="font-semibold text-sm">
                  Index Bindings
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBinding}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add
                </Button>
              </div>
              {bindings.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No index bindings.
                </div>
              )}
              <div className="space-y-2">
                {bindings.map((b, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className="flex-1 w-full rounded border px-2 py-1 text-xs border-gray-300"
                      placeholder="i"
                      value={b.index}
                      onChange={(e) =>
                        updateBinding(i, "index", e.target.value)
                      }
                    />
                    <span className="text-xs">in</span>
                    <input
                      className="flex-1 w-full rounded border px-2 py-1 text-xs border-gray-300"
                      placeholder="Set"
                      value={b.over}
                      onChange={(e) => updateBinding(i, "over", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBinding(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Toggle */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel className="font-semibold text-sm">
                  Condition (Filter)
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = getValues(
                      conditionPath as unknown as FieldPath<T>
                    ) as unknown as Expression | undefined;
                    if (current) {
                      setValue(
                        conditionPath as unknown as FieldPath<T>,
                        undefined as unknown as never,
                        { shouldDirty: true, shouldValidate: true }
                      );
                    } else {
                      setValue(
                        conditionPath as unknown as FieldPath<T>,
                        cloneDefaultExpression(
                          "comparison"
                        ) as unknown as never,
                        { shouldDirty: true, shouldValidate: true }
                      );
                    }
                  }}
                >
                  {getValues(conditionPath as unknown as FieldPath<T>)
                    ? "Remove"
                    : "Add"}
                </Button>
              </div>
            </div>

            {hasChildErrors && !hasDirectError && (
              <FormDescription className="text-orange-600 text-xs mb-3">
                ⚠ Contains validation errors in child expressions
              </FormDescription>
            )}
          </FormItem>
        );
      }}
    />
  );
};
