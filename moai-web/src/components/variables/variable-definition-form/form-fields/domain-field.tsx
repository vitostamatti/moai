import React from "react";
import { UseFormReturn } from "react-hook-form";
import type { VariableFormData } from "../types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DomainFieldProps {
  form: UseFormReturn<VariableFormData>;
}

const domainDescriptions = {
  Binary: "Binary variables (0 or 1)",
  NonNegativeIntegers: "Non-negative integers (0, 1, 2, ...)",
  NonNegativeReals: "Non-negative real numbers (≥ 0)",
  Reals: "Real numbers (-∞ to +∞)",
  Integers: "Integer numbers (..., -1, 0, 1, ...)",
};

export const DomainField = ({ form }: DomainFieldProps) => (
  <FormField
    control={form.control}
    name="domain"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Domain *</FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {Object.entries(domainDescriptions).map(([domain, description]) => (
              <SelectItem key={domain} value={domain}>
                <div>
                  <div className="font-medium">{domain}</div>
                  <div className="text-xs text-muted-foreground">
                    {description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);
