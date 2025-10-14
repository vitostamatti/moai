import { headers } from "next/headers";

import { auth } from "@/auth/server";
import { Session } from "@/auth/auth-types";

import { cache } from "react";

export type TRPCContext = {
  userId: string | null;
  session: Session | null;
};

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id ?? null;

  return { session: session ?? null, userId };
});

// export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
