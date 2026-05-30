import { projectRouter } from './routers/project';
import { userRouter } from './routers/user';
import { roleRouter } from './routers/role';
import { projectFieldRouter } from './routers/projectField';
import { projectFieldValueRouter } from './routers/projectFieldValue';
import { createCallerFactory, createTRPCRouter } from './trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  projectFieldValue: projectFieldValueRouter,
  projectField: projectFieldRouter,
  project: projectRouter,
  user: userRouter
  , role: roleRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
