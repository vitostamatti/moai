import { notFound } from "next/navigation";

import { trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ParameterEditorSection } from "@/components/pages/params-editor-page";
import React from "react";

interface PageProps {
  params: Promise<{ modelId: string; paramId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { modelId, paramId } = await params;
  // prefetch list + detail for SSR cache
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const detail = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!detail) return notFound();

  const breadcrumbs = [
    { url: `/models/${detail.model.id}`, label: detail.model.name },
    { url: `/models/${detail.model.id}/parameters`, label: "Parameters" },
    {
      url: `/models/${detail.model.id}/parameters/${paramId}`,
      label: "Editor",
    },
  ];

  return (
    <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
      <ParameterEditorSection modelId={modelId} paramId={paramId} />
    </ModelShellClient>
  );
};

export default Page;
