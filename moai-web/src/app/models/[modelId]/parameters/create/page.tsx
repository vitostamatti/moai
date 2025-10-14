import { notFound } from "next/navigation";
import { trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ParameterEditorSection } from "@/components/pages/params-editor-page";
import React from "react";

interface PageProps {
  params: Promise<{ modelId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { modelId } = await params;

  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const detail = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!detail) return notFound();

  const { model } = detail;
  const breadcrumbs = [
    { url: `/models/${model.id}`, label: model.name },
    { url: `/models/${model.id}/parameters`, label: "Parameters" },
    { url: `/models/${model.id}/parameters/create`, label: "New Parameter" },
  ];

  return (
    <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
      <ParameterEditorSection modelId={modelId} />
    </ModelShellClient>
  );
};

export default Page;
