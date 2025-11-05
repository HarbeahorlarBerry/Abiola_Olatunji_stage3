import { Mastra } from "@mastra/core/mastra";
import { taskBuddy } from "./agents/task-buddy";
import { a2aAgentRoute } from "./routes/a2a-agent-routes";

export const mastra = new Mastra({
  agents: {
    taskBuddy,
  },
  server: {
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute]
  },
});