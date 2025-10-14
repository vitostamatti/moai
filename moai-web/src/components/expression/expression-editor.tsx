import { Expression } from "@/lib/editor/expression/core/types";
import {
  ROLE_ALLOWED,
  ExprRole,
  isTypeAllowedForRole,
} from "@/lib/editor/expression/core/roles";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { NumberNodeFormField } from "./expression-nodes/number-form-field";
import { StringNodeFormField } from "./expression-nodes/string-form-field";
import { VariableNodeFormField } from "./expression-nodes/variable-form-field";
import { ParameterNodeFormField } from "./expression-nodes/parameter-form-field";
import { IndexNodeFormField } from "./expression-nodes/index-form-field";
import { BinaryOpNodeFormField } from "./expression-nodes/binary-op-form-field";
import { ComparisonNodeFormField } from "./expression-nodes/comparison-form-field";
import { UnaryOpNodeFormField } from "./expression-nodes/unary-op-form-field";
import { AggregateNodeFormField } from "./expression-nodes/aggregate-form-field";
import { IndexBinaryOpNodeFormField } from "./expression-nodes/index-binary-form-field";
import { IndexUnaryOpNodeFormField } from "./expression-nodes/index-unary-form-field";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// We deliberately use react-hook-form's FieldPathByValue for strong path typing

type ExpressionNodeEditorProps<T extends FieldValues> = {
  path: string;
  expression: Expression;
  control: Control<T>;
  title?: string;
  onTypeChange: (newType: Expression["type"]) => void;
  role?: ExprRole; // semantic role controls allowed types
};

export const ExpressionNodeEditor = <T extends FieldValues>({
  path,
  expression,
  control,
  onTypeChange,
  role = "scalar",
}: ExpressionNodeEditorProps<T>) => {
  const allowed = ROLE_ALLOWED[role];
  const renderNodeSpecificFields = () => {
    switch (expression.type) {
      case "number":
        return (
          <NumberNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Enter Value"
          />
        );

      case "string":
        return (
          <StringNodeFormField<T>
            name={`${path}` as FieldPath<T>}
            control={control}
            title="Enter Value"
          />
        );

      case "var":
        return (
          <VariableNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Variable Name"
          />
        );

      case "param":
        return (
          <ParameterNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Parameter Name"
          />
        );

      case "index":
        return (
          <IndexNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Index Variable"
          />
        );

      case "binary":
        return (
          <BinaryOpNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Binary Expression"
          />
        );

      case "comparison":
        return (
          <ComparisonNodeFormField<T>
            name={`${path}` as FieldPath<T>}
            control={control}
            title="Comparison Expression"
          />
        );

      case "unary":
        return (
          <UnaryOpNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Unary Expression"
          />
        );

      case "aggregate":
        return (
          <AggregateNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Aggregate Expression"
          />
        );
      case "index_binary":
        return (
          <IndexBinaryOpNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Index Binary"
          />
        );
      case "index_unary":
        return (
          <IndexUnaryOpNodeFormField<T>
            name={path as FieldPath<T>}
            control={control}
            title="Index Unary"
          />
        );

      default:
        return (
          <div className="text-red-600 text-sm">
            Unknown expression type: {(expression as { type: string }).type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Type Selector */}
      <div>
        <FormLabel className="text-sm font-medium">Expression Type</FormLabel>
        <Select
          value={expression.type}
          onValueChange={(value) => {
            const newType = value as Expression["type"];
            if (!isTypeAllowedForRole(newType, role)) return;
            onTypeChange(newType);
          }}
        >
          <SelectTrigger className="w-full mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allowed.map((t) => (
              <SelectItem key={t} value={t}>
                {labelForType(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {renderNodeSpecificFields()}
    </div>
  );
};

function labelForType(t: Expression["type"]): string {
  switch (t) {
    case "number":
      return "Number";
    case "string":
      return "String";
    case "var":
      return "Variable";
    case "param":
      return "Parameter";
    case "index":
      return "Index";
    case "binary":
      return "Binary";
    case "comparison":
      return "Comparison";
    case "unary":
      return "Unary";
    case "aggregate":
      return "Aggregate";
    case "index_binary":
      return "Index Binary";
    case "index_unary":
      return "Index Unary";
    default:
      return t;
  }
}
