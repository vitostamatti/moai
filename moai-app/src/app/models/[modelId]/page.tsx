import { getSession } from "@/auth/server";
import { AIAssistant } from "@/components/chat/ai-assistant";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { caller, HydrateClient, trpc } from "@/trpc/server";
import { notFound, redirect } from "next/navigation";

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
  await trpc.chat.list.prefetch({ modelId, limit: 5 });

  // Validate the model exists (use server caller so 404s are respected)
  const model = await caller.models.detail({ id: modelId }).catch(() => null);
  if (!model) return notFound();
  if (model.model.userId !== user.id) {
    return notFound();
  }

  return (
    <HydrateClient>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <AIAssistant modelId={modelId} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60}>model preview</ResizablePanel>
      </ResizablePanelGroup>
    </HydrateClient>
  );
};

export default Page;
