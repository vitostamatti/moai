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

import {
  getNestedFieldPath,
  hasNestedErrors,
} from "@/lib/editor/expression/utils/form-utils";
import { cn } from "@/lib/utils";

// String Expression Component
export const StringNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
}) => {
  const valueFieldPath = getNestedFieldPath(name, "value") as FieldPath<T>;

  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => {
        const hasError = hasNestedErrors(fieldState.error);

        return (
          <FormItem
            className={cn(
              `border-2 p-3 rounded bg-white ${
                hasError ? "border-red-300" : "border-blue-300"
              }`
            )}
          >
            {title && (
              <div className="text-xs font-mono text-gray-600 mb-2">
                {title}
              </div>
            )}

            <FormField
              control={control}
              name={valueFieldPath}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-blue-600 font-semibold text-sm">
                    String Value
                  </FormLabel>
                  <FormControl>
                    <Input
                      value={(field.value as string) || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className={
                        fieldState.error ? "border-red-300" : "border-gray-300"
                      }
                      placeholder="Enter string"
                    />
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
