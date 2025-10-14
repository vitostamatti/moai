import { notFound } from "next/navigation";
import { trpc, caller, HydrateClient } from "@/trpc/server";
import { ModelShellClient } from "@/components/layout/model-shell";
import { SetEditorSection } from "@/components/pages/set-editor-section";
import React from "react";

interface PageProps {
  params: Promise<{
    modelId: string;
    setId: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { modelId, setId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });
  await trpc.models.list.prefetch();
  await trpc.chat.list.prefetch({ limit: 5 });
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();

  const breadcrumbs = [
    { url: `/models/${model.model.id}`, label: model.model.name },
    { url: `/models/${model.model.id}/sets`, label: "Sets" },
    {
      url: `/models/${model.model.id}/sets/${setId}`,
      label: "Editor",
    },
  ];

  return (
    <HydrateClient>
      <ModelShellClient modelId={modelId} breadcrumbs={breadcrumbs}>
        <SetEditorSection modelId={modelId} setId={setId} />
      </ModelShellClient>
    </HydrateClient>
  );
};

export default Page;
