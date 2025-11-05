import { Mastra } from "@mastra/core/mastra";
import { taskBuddy } from "./agents/task-buddy";

export const mastra = new Mastra({
  agents: {
    taskBuddy,
  },
});