import { Expression } from "@/lib/editor/expression/core/types";
import {
  buildExpressionTree,
  ExpressionPath,
  hasNestedErrors,
  TreeNodeData,
} from "@/lib/editor/expression/utils/form-utils";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { FieldError } from "react-hook-form";

// Tree view component for expression structure
export const ExpressionTreeView = ({
  expression,
  basePath,
  selectedPath,
  expandedPaths,
  onSelect,
  onToggleExpand,
  errors,
}: {
  expression: Expression;
  basePath: ExpressionPath;
  selectedPath: ExpressionPath | null;
  expandedPaths: Set<ExpressionPath>;
  onSelect: (path: ExpressionPath) => void;
  onToggleExpand: (path: ExpressionPath) => void;
  errors?: FieldError;
}) => {
  const treeNodes = buildExpressionTree(expression, basePath);
  const nodePathSet = new Set(treeNodes.map((n) => n.path));

  // Find nearest ancestor path that corresponds to an actual node
  const findAncestorNodePath = (path: string): string | null => {
    const parts = path.split(".");
    // remove last segment iteratively until a node path is found
    while (parts.length > 0) {
      const candidate = parts.join(".");
      if (nodePathSet.has(candidate)) return candidate;
      parts.pop();
    }
    return null;
  };

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {treeNodes.map((node) => {
        const isExpanded = expandedPaths.has(node.path);
        const isSelected = selectedPath === node.path;

        // Skip children if parent is not expanded
        const immediateParent = node.path.split(".").slice(0, -1).join(".");
        let controllingParent = immediateParent;

        // If immediate parent isn't a node (e.g., ends with .indices), walk up to nearest node ancestor
        if (immediateParent && !nodePathSet.has(immediateParent)) {
          controllingParent = findAncestorNodePath(immediateParent) || "";
        }

        if (
          node.level > 0 &&
          controllingParent &&
          !expandedPaths.has(controllingParent)
        ) {
          return null;
        }

        // Get nested errors for this path
        const getNestedErrorsForPath = (
          err: FieldError | undefined,
          path: string
        ): FieldError | undefined => {
          if (!err) return undefined;
          const pathParts = path.replace("constraint.", "").split(".");
          let currentError = err;

          for (const part of pathParts) {
            if (
              currentError &&
              typeof currentError === "object" &&
              part in currentError
            ) {
              currentError = (currentError as Record<string, unknown>)[
                part
              ] as FieldError;
            } else {
              return undefined;
            }
          }

          return currentError;
        };

        const nodeErrors = getNestedErrorsForPath(errors, node.path);

        return (
          <ExpressionTreeNode
            key={node.path}
            nodeData={node}
            isSelected={isSelected}
            isExpanded={isExpanded}
            onSelect={onSelect}
            onToggleExpand={onToggleExpand}
            errors={nodeErrors}
          />
        );
      })}
    </div>
  );
};

// Tree node component for expression navigation
const ExpressionTreeNode = ({
  nodeData,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  errors,
}: {
  nodeData: TreeNodeData;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (path: ExpressionPath) => void;
  onToggleExpand: (path: ExpressionPath) => void;
  errors?: FieldError;
}) => {
  const hasError = hasNestedErrors(errors);
  const paddingLeft = nodeData.level * 16 + 8;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center cursor-pointer p-2 rounded text-sm ${
          isSelected ? "border bg-muted" : "hover:bg-gray-50"
        } ${hasError ? "border-l-4 border-l-red-400" : ""}`}
        style={{ paddingLeft }}
        onClick={() => onSelect(nodeData.path)}
      >
        {nodeData.hasChildren && (
          <button
            type="button"
            className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(nodeData.path);
            }}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-3 w-3" />
            ) : (
              <ChevronRightIcon className="h-3 w-3" />
            )}
          </button>
        )}

        {!nodeData.hasChildren && <div className="w-4 mr-1" />}

        <span className={`flex-1 ${hasError ? "text-red-600" : ""}`}>
          {nodeData.label}
        </span>

        {hasError && <span className="text-red-500 text-xs ml-2">⚠</span>}
      </div>
    </div>
  );
};
