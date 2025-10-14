"use client";

import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import {
  getNestedFieldPath,
  hasNestedErrors,
} from "@/lib/editor/expression/utils/form-utils";
import { cn } from "@/lib/utils";
import type { Expression } from "@/lib/editor/expression/core/types";

type ParameterNodeFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
};

export const ParameterNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: ParameterNodeFormFieldProps<T>) => {
  const nameFieldPath = getNestedFieldPath(name, "name") as FieldPath<T>;
  const indicesFieldPath = getNestedFieldPath(name, "indices") as FieldPath<T>;
  const hasError = hasNestedErrors(control.getFieldState(name).error);
  return (
    <FormItem
      className={cn(
        `border-2 p-3 rounded-md bg-white`,
        hasError ? "border-red-300" : "border-foreground-muted "
      )}
    >
      <FormField
        control={control}
        name={nameFieldPath}
        render={({ field, fieldState }) => {
          return (
            <FormItem>
              {title && <FormLabel>{title}</FormLabel>}
              <FormControl>
                <Input
                  value={(field.value as string) || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className={
                    fieldState.error ? "border-red-300" : "border-gray-300"
                  }
                  placeholder="capacity"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Indices Management (structure only; detailed editing via tree) */}
      <FormField
        control={control}
        name={indicesFieldPath}
        render={({ field }) => {
          const indices = (field.value as Expression[]) || [];

          const addIndex = () => {
            field.onChange([...(indices || []), { type: "index", name: "" }]);
          };
          const removeLast = () => {
            if (!indices.length) return;
            field.onChange(indices.slice(0, -1));
          };

          return (
            <FormItem className="mt-3">
              <div className="flex items-center justify-between">
                <FormLabel>Indices ({indices.length})</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addIndex}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!indices.length}
                    onClick={removeLast}
                    className="h-6 px-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Index expressions appear as child nodes in the tree. Select each
                index to edit its expression.
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </FormItem>
  );
};
