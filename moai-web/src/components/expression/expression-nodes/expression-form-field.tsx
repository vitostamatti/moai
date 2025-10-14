"use client";

import React from "react";
import { useWatch, Control, FieldPath, FieldValues } from "react-hook-form";

import type { Expression } from "@/lib/editor/expression/core/types";
import { NumberNodeFormField } from "./number-form-field";
import { StringNodeFormField } from "./string-form-field";
import { IndexNodeFormField } from "./index-form-field";
import { VariableNodeFormField } from "./variable-form-field";
import { ParameterNodeFormField } from "./parameter-form-field";
import { BinaryOpNodeFormField } from "./binary-op-form-field";
import { ComparisonNodeFormField } from "./comparison-form-field";
import { UnaryOpNodeFormField } from "./unary-op-form-field";
import { AggregateNodeFormField } from "./aggregate-form-field";

export interface ExpressionFormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  title?: string;
}

// Base Expression Node Component that routes to appropriate sub-components
export const ExpressionNodeFormField = <T extends FieldValues>(
  props: ExpressionFormFieldProps<T>
) => {
  const { name, control, title } = props;

  const fieldValue = useWatch({
    control,
    name,
  }) as Expression;

  if (!fieldValue || !fieldValue.type) {
    return (
      <div className={`border-2 border-red-300 p-3 rounded text-red-600`}>
        <div className="text-sm font-medium text-red-600 mb-2">
          {title && `${title}: `}Invalid Expression
        </div>
        <p className="text-xs">
          Expression is missing or has invalid structure
        </p>
      </div>
    );
  }

  switch (fieldValue.type) {
    case "number":
      return (
        <NumberNodeFormField name={name} control={control} title={title} />
      );
    case "string":
      return (
        <StringNodeFormField name={name} control={control} title={title} />
      );
    case "index":
      return <IndexNodeFormField name={name} control={control} title={title} />;
    case "var":
      return (
        <VariableNodeFormField name={name} control={control} title={title} />
      );
    case "param":
      return (
        <ParameterNodeFormField name={name} control={control} title={title} />
      );
    case "binary":
      return (
        <BinaryOpNodeFormField name={name} control={control} title={title} />
      );
    case "comparison":
      return (
        <ComparisonNodeFormField name={name} control={control} title={title} />
      );
    case "unary":
      return (
        <UnaryOpNodeFormField name={name} control={control} title={title} />
      );
    case "aggregate":
      return (
        <AggregateNodeFormField name={name} control={control} title={title} />
      );
    default:
      return (
        <div className={`border-2 border-gray-300 p-3 rounded text-red-600`}>
          <div className="text-sm font-medium text-red-600 mb-2">
            {title && `${title}: `}Unknown Expression Type
          </div>
          <p className="text-xs">
            Type:{" "}
            {String((fieldValue as Record<string, unknown>)?.type) ||
              "undefined"}
          </p>
        </div>
      );
  }
};
