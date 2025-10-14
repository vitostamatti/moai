import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SetFormData } from "@/lib/editor/set/set-form-schema";
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

interface ElementTypeFieldProps {
  form: UseFormReturn<SetFormData>;
  onElementTypeChange: (value: string) => void;
}

export const ElementTypeField = ({
  form,
  onElementTypeChange,
}: ElementTypeFieldProps) => (
  <FormField
    control={form.control}
    name="elementType"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Element Type</FormLabel>
        <Select
          onValueChange={(value) => {
            field.onChange(value);
            onElementTypeChange(value);
          }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select element type" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="string">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
          </SelectContent>
        </Select>
        <FormDescription>
          Choose whether elements are text or numbers.
        </FormDescription>
      </FormItem>
    )}
  />
);
