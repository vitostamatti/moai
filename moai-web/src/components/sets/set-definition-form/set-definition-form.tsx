"use client";
import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { SetDefinition } from "@/lib/editor/set/set-schema";
import { SetFormData } from "@/lib/editor/set/set-form-schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  NameField,
  DescriptionField,
  ElementTypeField,
  ElementsManagementField,
  FormActions,
} from "./form-fields";
import { useRouter } from "next/navigation";
import { DraftField } from "./form-fields/draft-field";

type SetDefinitionFormProps = {
  initialSet?: SetDefinition;
  form: UseFormReturn<SetFormData>;
  onSubmit: (data: SetFormData) => void;
};

export const SetDefinitionForm = ({
  initialSet,
  form,
  onSubmit,
}: SetDefinitionFormProps) => {
  const router = useRouter();

  const [newElement, setNewElement] = useState("");

  const { watch, setValue } = form;

  const elementType = watch("elementType");
  const elements = watch("elements");

  const isValidElement = (input: string) => {
    if (!input.trim()) return false;

    if (elementType === "number") {
      const num = parseFloat(input.trim());
      return !isNaN(num) && isFinite(num);
    }
    return input.trim().length > 0;
  };

  const isDuplicateElement = (input: string) => {
    const currentElements = elements || [];
    return currentElements.includes(input.trim());
  };

  const hasTypeMismatch = () => {
    if (!elements || elements.length === 0) return false;

    if (elementType === "number") {
      return elements.some((el) => {
        const num = parseFloat(el);
        return isNaN(num) || !isFinite(num);
      });
    }
    return false;
  };

  const isFormValid = () => {
    const nameValid = form.watch("name")?.trim().length > 0;
    const hasElements = elements && elements.length > 0;
    const noTypeMismatch = !hasTypeMismatch();
    return nameValid && hasElements && noTypeMismatch;
  };

  const handleAddElement = () => {
    if (!newElement.trim()) return;

    const elementStr = newElement.trim();
    const currentElements = elements || [];

    // Check for duplicates
    if (currentElements.includes(elementStr)) {
      return; // Don't add duplicates
    }

    // Validate element type
    if (elementType === "number") {
      const num = parseFloat(elementStr);
      if (isNaN(num) || !isFinite(num)) {
        return; // Invalid number
      }
    }

    setValue("elements", [...currentElements, elementStr]);
    setNewElement("");
  };

  const handleRemoveElement = (index: number) => {
    const currentElements = elements || [];
    setValue(
      "elements",
      currentElements.filter((_, i) => i !== index)
    );
  };

  const handleCancel = () => {
    router.back();
  };

  const handleElementTypeChange = () => {
    setNewElement("");
  };

  return (
    <Card className="h-full flex flex-col">
      <Form {...form} key={initialSet?.id || "new"}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Set Editor</CardTitle>
              <CardDescription>
                Configure the properties and elements of your set.
              </CardDescription>
            </div>
            <DraftField form={form} />
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-6">
            <NameField form={form} />

            <DescriptionField form={form} />

            <ElementTypeField
              form={form}
              onElementTypeChange={handleElementTypeChange}
            />

            <ElementsManagementField
              form={form}
              elementType={elementType}
              elements={elements || []}
              newElement={newElement}
              setNewElement={setNewElement}
              onAddElement={handleAddElement}
              onRemoveElement={handleRemoveElement}
              isValidElement={isValidElement}
              isDuplicateElement={isDuplicateElement}
              hasTypeMismatch={hasTypeMismatch}
            />
          </CardContent>
          <CardFooter className=" flex justify-end gap-2">
            <FormActions onCancel={handleCancel} isFormValid={isFormValid} />
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
