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

type IndexNodeFormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
};

export const IndexNodeFormField = <T extends FieldValues>({
  name,
  control,
  title,
}: IndexNodeFormFieldProps<T>) => {
  const nameFieldPath = getNestedFieldPath(name, "name") as FieldPath<T>;

  return (
    <FormField
      control={control}
      name={name}
      render={({ fieldState }) => {
        const hasError = hasNestedErrors(fieldState.error);

        return (
          <FormItem
            className={cn(
              `border-2 p-3 rounded-md bg-white ${
                hasError ? "border-red-300" : "border-foreground-muted "
              }`
            )}
          >
            <FormField
              control={control}
              name={nameFieldPath}
              render={({ field, fieldState }) => (
                <FormItem>
                  {title && <FormLabel>{title}</FormLabel>}
                  <FormControl>
                    <Input
                      value={(field.value as string) || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      className={`w-20 ${
                        fieldState.error ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="i"
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
