"use client";

import {
  useFormContext,
  Control,
  FieldValues,
  FieldPath,
  FieldPathByValue,
} from "react-hook-form";
import { Expression } from "@/lib/editor/expression/core/types";
import { ExpressionNodeEditor } from "./expression-editor";
import {
  getRoleForPath,
  cloneDefaultExpression,
} from "@/lib/editor/expression/utils/role-utils";
import { ROLE_ALLOWED } from "@/lib/editor/expression/core/roles";

interface ExpressionSelectionEditorProps<T extends FieldValues> {
  rootExpression: Expression;
  rootPath: string; // base form path for root expression
  selectedPath: string | null; // full path in form
  control: Control<T>;
  onAfterTypeChange?: (newType: Expression["type"]) => void;
}

export const ExpressionSelectionEditor = <T extends FieldValues>({
  rootExpression,
  rootPath,
  selectedPath,
  control,
  onAfterTypeChange,
}: ExpressionSelectionEditorProps<T>) => {
  const { setValue, getValues } = useFormContext<T>();

  if (!selectedPath) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded">
        Select an expression node to edit.
      </div>
    );
  }

  const path = selectedPath as FieldPath<T>;
  const currentNode = getValues(path) as unknown as Expression | undefined;
  if (!currentNode || !currentNode.type) {
    return (
      <div className="text-sm text-red-600 p-4 border rounded">
        Invalid node at path: {selectedPath}
      </div>
    );
  }

  // Re-fetch root to ensure freshest value if form mutated
  const latestRoot =
    (getValues(rootPath as FieldPath<T>) as unknown as Expression) ||
    rootExpression;
  const role = getRoleForPath(latestRoot, rootPath, selectedPath);
  const exprPath = path as unknown as FieldPathByValue<T, Expression>;

  return (
    <ExpressionNodeEditor
      path={exprPath}
      expression={currentNode}
      control={control}
      role={role}
      onTypeChange={(newType) => {
        const allowed = ROLE_ALLOWED[role];
        if (!allowed.includes(newType)) return;
        // cast through unknown because RHF path generic can't easily express discriminated union assignment
        setValue(path, cloneDefaultExpression(newType) as unknown as never, {
          shouldDirty: true,
          shouldValidate: true,
        });
        onAfterTypeChange?.(newType);
      }}
    />
  );
};
