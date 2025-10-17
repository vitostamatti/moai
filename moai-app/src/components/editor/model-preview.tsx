"use client";
import { modelWithComponentsToModel } from "@/lib/ai/utils";
import { modelToString } from "@/lib/model/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  modelId: string;
};
export const ModelPreview = ({ modelId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );
  const model = {
    sets: data.sets.map((s) => s.data),
    parameters: data.parameters.map((p) => p.data),
    variables: data.variables.map((v) => v.data),
    constraints: data.constraints.map((c) => c.data),
    objective: data.objectives.length > 0 ? data.objectives[0].data : undefined,
  };
  const modelString = modelToString(model);
  return (
    <div className="p-4">
      <pre>{modelString}</pre>
    </div>
  );
};
