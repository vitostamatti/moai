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

type UnaryOpNodeFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
};

// Unary Expression Component
export const UnaryOpNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: UnaryOpNodeFormFieldProps<T>) => {
  const opFieldPath = getNestedFieldPath(name, "op") as FieldPath<T>;

  // const exprFieldPath = getNestedFieldPath(name, "expr");

  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => {
        const hasDirectError = !!fieldState.error?.message;
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
              render={({ field: opField, fieldState: opFieldState }) => (
                <FormItem>
                  {title && <FormLabel>{title}</FormLabel>}
                  <FormControl>
                    <Select
                      value={(opField.value as string) || "-"}
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
                        <SelectItem value="-">- (Negative)</SelectItem>
                        <SelectItem value="abs">
                          abs (Absolute value)
                        </SelectItem>
                        <SelectItem value="sin">sin (Sine)</SelectItem>
                        <SelectItem value="cos">cos (Cosine)</SelectItem>
                        <SelectItem value="tan">tan (Tangent)</SelectItem>
                        <SelectItem value="exp">exp (Exponential)</SelectItem>
                        <SelectItem value="log">log (Logarithm)</SelectItem>
                        <SelectItem value="sqrt">sqrt (Square root)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasErrors && !hasDirectError && (
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
