import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ParamDefinitionFormSchema } from "@/lib/editor/param/param-form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface IndexedValuesFieldProps {
  form: UseFormReturn<ParamDefinitionFormSchema>;
  indices: string[];
  indexedValues: { index: string[]; value: string }[];
  validationStatus: {
    isComplete: boolean;
    missing: string[][];
    total: number;
    defined?: number;
  };
  onUpdateIndexValue: (index: number, newValue: string) => void;
}

export const IndexedValuesField = ({
  form,
  indices,
  indexedValues,
  validationStatus,
  onUpdateIndexValue,
}: IndexedValuesFieldProps) => (
  <FormField
    control={form.control}
    name="indexedValues"
    render={() => (
      <FormItem>
        <FormLabel>Indexed Values *</FormLabel>

        {/* Validation Status */}
        {indices && indices.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            {validationStatus.isComplete ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>
                  All combinations defined ({validationStatus.defined}/
                  {validationStatus.total})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Missing {validationStatus.missing.length} combinations (
                  {validationStatus.defined}/{validationStatus.total})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {indices && indices.length > 0 && indexedValues.length === 0 && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
            💡 Add at least one set as an index above to automatically generate
            all possible combinations.
          </div>
        )}

        {/* Values table */}
        {indexedValues.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Parameter Values ({indexedValues.length} combinations):
            </div>
            <div className="border rounded-md max-h-80 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    {indices &&
                      indices.map((indexName, idx) => (
                        <TableHead key={idx} className="text-xs font-medium">
                          {indexName}
                        </TableHead>
                      ))}
                    <TableHead className="text-xs font-medium">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indexedValues.map((value, index) => (
                    <TableRow key={index}>
                      {value.index.map((indexVal, idx) => (
                        <TableCell key={idx} className="text-sm py-2">
                          {indexVal}
                        </TableCell>
                      ))}
                      <TableCell className="py-2">
                        <Input
                          type="number"
                          step="any"
                          value={value.value}
                          onChange={(e) =>
                            onUpdateIndexValue(index, e.target.value)
                          }
                          className="text-sm"
                          placeholder="0"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-xs text-muted-foreground">
              All possible combinations are automatically generated. Simply
              enter the values for each combination.
            </div>
          </div>
        )}

        {/* Empty state when no indices */}
        {(!indices || indices.length === 0) && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
            Select at least one set as an index above to define indexed
            parameter values.
          </div>
        )}

        <FormMessage />
      </FormItem>
    )}
  />
);
