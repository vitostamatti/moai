import { router } from "../init";
import { modelsRouter } from "./models";
import { variablesRouter } from "./variables";
import { parametersRouter } from "./parameters";
import { constraintsRouter } from "./constraints";
import { objectivesRouter } from "./objectives";
import { chatRouter } from "./chat";
import { setsRouter } from "./sets";

export const appRouter = router({
  models: modelsRouter,
  sets: setsRouter,
  variables: variablesRouter,
  parameters: parametersRouter,
  constraints: constraintsRouter,
  objectives: objectivesRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
