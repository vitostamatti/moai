import { notFound } from "next/navigation";
import { trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { VariablesEditorPage } from "@/components/pages/variables-editor-page";
import React from "react";

interface PageProps {
  params: Promise<{
    modelId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();

  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/variables`, label: "Variables" },
    { url: `/models/${model.model.id}/variables/create`, label: "Editor" },
  ];

  return (
    <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
      <VariablesEditorPage modelId={modelId} initialSets={model.sets} />
    </ModelShellClient>
  );
};

export default Page;
