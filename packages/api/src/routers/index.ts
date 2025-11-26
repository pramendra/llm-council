import { router, publicProcedure } from "../index";
import { councilRouter } from "./council";

export const appRouter = router({
  // Health check
  healthCheck: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),

  // Council routes
  council: councilRouter,
});

export type AppRouter = typeof appRouter;
