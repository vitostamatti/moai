import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Middleware to require an authenticated session and an active organization
const requireAuth = t.middleware(({ ctx, next }) => {
  const { session, userId } = ctx;
  if (!session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "No active session" });
  }
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No active user",
    });
  }

  // Narrow types for downstream resolvers
  return next({
    ctx: {
      ...ctx,
      session,
      userId,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const createCallerFactory = t.createCallerFactory;
