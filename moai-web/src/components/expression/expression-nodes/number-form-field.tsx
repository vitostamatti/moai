"use client";

import React from "react";
import {
  Control,
  FieldPath,
  FieldPathByValue,
  FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { hasNestedErrors } from "@/lib/editor/expression/utils/form-utils";
import { cn } from "@/lib/utils";

type NumberNodeFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
};

export const NumberNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: NumberNodeFormFieldProps<T>) => {
  return (
    <FormField
      control={control}
      name={`${name}.value` as FieldPathByValue<T, number>}
      render={({ field, fieldState }) => {
        const hasError = hasNestedErrors(fieldState.error);

        return (
          <FormItem
            className={cn(
              `border-2 p-3 rounded-md bg-white ${
                hasError ? "border-red-300" : "border-foreground-muted "
              }`
            )}
          >
            {title && <FormLabel>{title}</FormLabel>}
            <FormControl>
              <Input
                type="decimal"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" || Number.isNaN(e.target.value)
                      ? ""
                      : Number(e.target.value)
                  )
                }
                onBlur={field.onBlur}
                className={cn(
                  "w-32",
                  fieldState.error ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Enter number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
