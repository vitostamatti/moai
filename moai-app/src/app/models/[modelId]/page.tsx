import { getSession } from "@/auth/server";
import { caller, trpc } from "@/trpc/server";
import { not } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import React from "react";
type Props = {
  params: Promise<{
    modelId: string;
  }>;
};
const Page = async ({ params }: Props) => {
  const { user } = await getSession();
  if (!user) {
    return redirect("/");
  }
  const { modelId } = await params;
  await trpc.models.detail.prefetch({ id: modelId });

  // Validate the model exists (use server caller so 404s are respected)
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  if (model.model.userId !== user.id) {
    return notFound();
  }
  // here we'll show the chat on the left and the model details on the right.
  // model details will simply be a render of the model for now but we'll improve it
  return <div>model page</div>;
};

export default Page;
