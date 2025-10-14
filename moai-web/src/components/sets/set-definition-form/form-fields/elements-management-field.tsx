import React from "react";
import { UseFormReturn } from "react-hook-form";
import { SetFormData } from "@/lib/editor/set/set-form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface ElementsManagementFieldProps {
  form: UseFormReturn<SetFormData>;
  elementType: string;
  elements: string[];
  newElement: string;
  setNewElement: (value: string) => void;
  onAddElement: () => void;
  onRemoveElement: (index: number) => void;
  isValidElement: (input: string) => boolean;
  isDuplicateElement: (input: string) => boolean;
  hasTypeMismatch: () => boolean;
}

export const ElementsManagementField = ({
  form,
  elementType,
  elements,
  newElement,
  setNewElement,
  onAddElement,
  onRemoveElement,
  isValidElement,
  isDuplicateElement,
  hasTypeMismatch,
}: ElementsManagementFieldProps) => (
  <FormField
    control={form.control}
    name="elements"
    render={() => (
      <FormItem>
        <FormLabel>Elements *</FormLabel>

        {/* Add new element */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              placeholder={
                elementType === "number"
                  ? "e.g., 1, 2, 3"
                  : "e.g., Seattle, Chicago"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddElement();
                }
              }}
              className={
                newElement && !isValidElement(newElement)
                  ? "border-destructive"
                  : ""
              }
            />
            {newElement && (
              <div className="text-xs mt-1">
                {!isValidElement(newElement) && (
                  <span className="text-destructive">
                    {elementType === "number"
                      ? "Please enter a valid number"
                      : "Please enter valid text"}
                  </span>
                )}
                {isValidElement(newElement) &&
                  isDuplicateElement(newElement) && (
                    <span className="text-amber-600">
                      This element already exists
                    </span>
                  )}
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={onAddElement}
            size="sm"
            disabled={
              !newElement ||
              !isValidElement(newElement) ||
              isDuplicateElement(newElement)
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Current elements */}
        {elements && elements.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Current elements ({elements.length}):
            </div>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
              {elements.map((element, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {element}
                  <button
                    type="button"
                    onClick={() => onRemoveElement(index)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Type mismatch warning */}
        {hasTypeMismatch() && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border">
            Some elements are not valid {elementType}s. Please remove invalid
            elements or change the element type.
          </div>
        )}

        <FormMessage />
      </FormItem>
    )}
  />
);
