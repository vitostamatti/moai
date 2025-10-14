import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ValueTypeFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
  onValueTypeChange: (value: "scalar" | "indexed") => void;
}

export const ValueTypeField = ({
  form,
  onValueTypeChange,
}: ValueTypeFieldProps) => (
  <FormField
    control={form.control}
    name="valueType"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Value Type</FormLabel>
        <Select
          onValueChange={(value: "scalar" | "indexed") => {
            field.onChange(value);
            onValueTypeChange(value);
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select value type" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="scalar">Single Value</SelectItem>
            <SelectItem value="indexed">Indexed Values</SelectItem>
          </SelectContent>
        </Select>
        <FormDescription>
          Choose whether this parameter has a single value or multiple indexed
          values. Indexed values will be auto-populated for all combinations.
        </FormDescription>
      </FormItem>
    )}
  />
);
