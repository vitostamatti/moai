import { notFound } from "next/navigation";
import { trpc, caller } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { ObjectiveEditorSection } from "@/components/pages/objective-editor-page";
import React from "react";

interface PageProps {
  params: Promise<{ modelId: string; objId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { modelId, objId } = await params;

  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  const detail = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!detail) return notFound();

  const breadcrumbs = [
    { url: `/models/${detail.model.id}`, label: detail.model.name },
    { url: `/models/${detail.model.id}/objective`, label: "Objective" },
    {
      url: `/models/${detail.model.id}/objective/${objId}`,
      label: "Editor",
    },
  ];
  return (
    <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
      <ObjectiveEditorSection modelId={modelId} objId={objId} />
    </ModelShellClient>
  );
};

export default Page;
