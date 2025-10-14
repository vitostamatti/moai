import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { VariableFormData } from "../types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toPythonIdentifier } from "@/lib/identifiers";

interface NameFieldProps {
  form: UseFormReturn<VariableFormData>;
}

export const NameField = ({ form }: NameFieldProps) => (
  <FormField
    control={form.control}
    name="name"
    rules={{ required: "Name is required" }}
    render={({ field }) => {
      const currentName = form.watch("name") ?? "";
      const symbolPreview = currentName ? toPythonIdentifier(currentName) : "";

      return (
        <FormItem>
          <FormLabel>Variable Name *</FormLabel>
          <FormControl>
            <Input
              placeholder="x, y, z, etc."
              {...field}
              onBlur={field.onBlur}
            />
          </FormControl>
          <FormDescription>
            Give your variable a human-friendly name. We auto-generate a solver
            symbol under the hood
            {symbolPreview && (
              <>
                :{" "}
                <code className="ml-1 text-muted-foreground">
                  {symbolPreview}
                </code>
              </>
            )}
            .
          </FormDescription>
          <FormMessage />
        </FormItem>
      );
    }}
  />
);
