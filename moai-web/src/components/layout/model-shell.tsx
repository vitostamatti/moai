"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ModelLayoutWithSidebar } from "@/components/layout/model-sidebar";
import type { ModelWithComponents } from "@/db/types";
import type { Breadcrumbs } from "@/components/layout/model-nav";

type Props = {
  modelId: string;
  breadcrumbs?: Breadcrumbs[];
  children: React.ReactNode;
};

export function ModelShellClient({ modelId, breadcrumbs, children }: Props) {
  const trpc = useTRPC();
  const { data: detail } = useSuspenseQuery(
    trpc.models.detail.queryOptions({ id: modelId })
  );
  const { data: list } = useSuspenseQuery(trpc.models.list.queryOptions());

  const models = list.map((m) => ({
    id: m.id,
    name: m.name,
    version: m.version ?? 1,
    description: m.description ?? undefined,
  }));

  const model = {
    ...detail.model,
    sets: detail.sets,
    parameters: detail.parameters,
    variables: detail.variables,
    constraints: detail.constraints,
    objectives: detail.objectives,
  } satisfies ModelWithComponents;

  return (
    <ModelLayoutWithSidebar
      model={model}
      models={models}
      breadcrumbs={breadcrumbs}
    >
      {children}
    </ModelLayoutWithSidebar>
  );
}
