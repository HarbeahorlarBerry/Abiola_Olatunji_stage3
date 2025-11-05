import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

// In-memory task storage
const taskStore: Record<string, any> = {};

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
const model = google("gemini-2.0-flash");

// Create Task Tool
const createTaskTool = createTool({
  id: "create-task",
  description: "Create a new task with an optional due date",
  inputSchema: z.object({
    title: z.string().describe("The task title"),
    due: z.string().optional().describe("Optional due date"),
  }),
  outputSchema: z.object({
    message: z.string(),
    taskId: z.string(),
  }),
  execute: async ({ context }) => {
    const { title, due } = context;
    const taskId = `task:${Date.now()}`;
    taskStore[taskId] = {
      title,
      due,
      createdAt: new Date().toISOString(),
    };
    return {
      message: `:white_tick: Task created: "${title}"${due ? ` - due ${due}` : ""}`,
      taskId,
    };
  },
});

// List Tasks Tool
const listTasksTool = createTool({
  id: "list-tasks",
  description: "List all tasks",
  inputSchema: z.object({}),
  outputSchema: z.object({
    tasks: z.array(
      z.object({
        title: z.string(),
        due: z.string().optional(),
        createdAt: z.string(),
      })
    ),
    message: z.string(),
  }),
  execute: async () => {
    const tasks = Object.values(taskStore);
    if (!tasks.length) {
      return {
        tasks: [],
        message: "📭 No tasks found.",
      };
    }
    const lines = tasks.map(
      (t: any, i: number) =>
        `${i + 1}. ${t.title}${t.due ? ` (due ${t.due})` : ""}`
    );
    return {
      tasks,
      message: `🗒️ Your tasks:\n${lines.join("\n")}`,
    };
  },
});

const taskBuddy = new Agent({
  name: "Task Buddy",
  instructions: `
    You are Task Buddy — a helpful assistant that helps users create, list, and summarise their tasks.

    When a user wants to create a task, use the createTask tool.
    When a user asks for a summary or wants to see their tasks, use the listTasks tool.

    Always respond clearly and briefly.
  `,
  model,
  tools: {
    createTask: createTaskTool,
    listTasks: listTasksTool,
  },
});

export { taskBuddy };