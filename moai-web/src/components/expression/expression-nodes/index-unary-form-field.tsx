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
import {
  getNestedFieldPath,
  hasNestedErrors,
} from "@/lib/editor/expression/utils/form-utils";
import { cn } from "@/lib/utils";

interface IndexUnaryOpNodeFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
}

export const IndexUnaryOpNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: IndexUnaryOpNodeFormFieldProps<T>) => {
  const opFieldPath = getNestedFieldPath(name, "op") as FieldPath<T>;
  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => {
        const hasErrors = hasNestedErrors(fieldState.error);
        return (
          <FormItem
            className={cn(
              `border-2 p-3 rounded-md bg-white ${
                hasErrors ? "border-red-300" : "border-foreground-muted "
              }`
            )}
          >
            <FormField
              control={control}
              name={opFieldPath}
              render={({ field, fieldState }) => (
                <FormItem>
                  {title && <FormLabel>{title}</FormLabel>}
                  <FormControl>
                    <select
                      value={(field.value as string) || "-"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className={`w-24 border rounded px-2 py-1 text-sm ${
                        fieldState.error ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      <option value="-">- (Neg)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormItem>
        );
      }}
    />
  );
};
