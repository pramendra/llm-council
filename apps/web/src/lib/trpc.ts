import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@council/api/routers";

export const trpc = createTRPCReact<AppRouter>();
