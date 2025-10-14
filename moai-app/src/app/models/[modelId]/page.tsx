import { getSession } from "@/auth/server";
import { AIAssistant } from "@/components/chat/ai-assistant";
import { MoaiIcon } from "@/components/icons";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { UserAvatar } from "@/components/user-avatar";
import { caller, HydrateClient, trpc } from "@/trpc/server";
import Link from "next/link";
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

  return (
    <HydrateClient>
      <Navbar user={user}>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={40}>
            <AIAssistant modelId={modelId} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} className="h-full">
            model preview
          </ResizablePanel>
        </ResizablePanelGroup>
      </Navbar>
    </HydrateClient>
  );
};

export default Page;

const Navbar = ({
  user,
  children,
}: {
  children: React.ReactNode;
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null | undefined;
  } | null;
}) => {
  return (
    <div className="flex w-full h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <MoaiIcon className="size-6 text-primary" />
            <span className="text-xl font-bold">MOAI</span>
          </Link>
          <div className="flex items-center space-x-2">
            <UserAvatar
              name={user?.name}
              email={user?.email}
              image={user?.image as string | undefined}
            />
          </div>
        </div>
      </nav>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
};
