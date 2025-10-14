"use client";

import React from "react";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Comparison Expression Component (for quantifier conditions)
export const ComparisonNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
}) => {
  const opFieldPath = getNestedFieldPath(name, "op") as FieldPath<T>;

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
              `border-2 p-3 rounded-md bg-white ${
                hasChildErrors ? "border-red-300" : "border-foreground-muted "
              }`
            )}
          >
            <FormField
              control={control}
              name={opFieldPath}
              render={({ field: opField, fieldState: opFieldState }) => (
                <FormItem className="mb-4">
                  {title && <FormLabel>{title}</FormLabel>}
                  <FormControl>
                    <Select
                      value={(opField.value as string) || "="}
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
                        <SelectItem value="=">=&nbsp;(Equals)</SelectItem>
                        <SelectItem value="<=">
                          &le;&nbsp;(Less than or equal)
                        </SelectItem>
                        <SelectItem value=">=">
                          &ge;&nbsp;(Greater than or equal)
                        </SelectItem>
                        <SelectItem value="<">&lt;&nbsp;(Less than)</SelectItem>
                        <SelectItem value=">">
                          &gt;&nbsp;(Greater than)
                        </SelectItem>
                        <SelectItem value="!=">
                          &ne;&nbsp;(Not equal)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
