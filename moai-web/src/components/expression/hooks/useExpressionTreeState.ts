"use client";
import { useCallback, useState } from "react";
import type { Expression } from "@/lib/editor/expression/core/types";
import type { ExpressionPath } from "@/lib/editor/expression/utils/form-utils";

// Identify expression node types that typically contain / introduce children.
export function expressionTypeHasChildren(t: string) {
  return (
    t === "binary" ||
    t === "comparison" ||
    t === "unary" ||
    t === "aggregate" ||
    t === "var" ||
    t === "param" ||
    t === "index_binary" ||
    t === "index_unary"
  );
}

interface UseExpressionTreeStateOptions<T = unknown> {
  rootObject: T;
  rootKey: string; // first segment in path e.g. "constraint"
  initialSelectedPath?: ExpressionPath | null;
  initialExpandedPaths?: Iterable<ExpressionPath>;
}

export interface ExpressionTreeState {
  selectedPath: ExpressionPath | null;
  expandedPaths: Set<ExpressionPath>;
  selectPath: (p: ExpressionPath | null) => void;
  toggleExpand: (p: ExpressionPath) => void;
  getSelectedExpression: () => Expression | null;
  setExpandedPaths: React.Dispatch<React.SetStateAction<Set<ExpressionPath>>>;
  setSelectedPath: React.Dispatch<React.SetStateAction<ExpressionPath | null>>;
}

export function useExpressionTreeState<T = unknown>(
  options: UseExpressionTreeStateOptions<T>
): ExpressionTreeState {
  const {
    rootObject,
    rootKey,
    initialSelectedPath = null,
    initialExpandedPaths = [],
  } = options;

  const [selectedPath, setSelectedPath] = useState<ExpressionPath | null>(
    initialSelectedPath
  );
  const [expandedPaths, setExpandedPaths] = useState<Set<ExpressionPath>>(
    () => new Set(initialExpandedPaths)
  );

  const selectPath = useCallback((p: ExpressionPath | null) => {
    setSelectedPath(p);
  }, []);

  const toggleExpand = useCallback((path: ExpressionPath) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const getSelectedExpression = useCallback((): Expression | null => {
    if (!selectedPath) return null;
    const parts = selectedPath.split(".");
    if (parts[0] !== rootKey) return null;
    let current: unknown = rootObject;
    for (let i = 1; i < parts.length; i++) {
      if (
        current &&
        typeof current === "object" &&
        Object.prototype.hasOwnProperty.call(current, parts[i])
      ) {
        current = (current as Record<string, unknown>)[parts[i]];
      } else {
        return null;
      }
    }
    return current as Expression;
  }, [rootKey, rootObject, selectedPath]);

  return {
    selectedPath,
    expandedPaths,
    selectPath,
    toggleExpand,
    getSelectedExpression,
    setExpandedPaths,
    setSelectedPath,
  };
}
