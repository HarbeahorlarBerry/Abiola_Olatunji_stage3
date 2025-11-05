import { registerApiRoute } from '@mastra/core/server';
import { randomUUID } from 'crypto';

export const a2aAgentRoute = registerApiRoute('/a2a/agent/:agentId', {
  method: 'POST',
  handler: async (c) => {
    console.log("🔵 A2A request received");
    try {
      const mastra = c.get('mastra');
      const agentId = c.req.param('agentId');
      const body = await c.req.json();
      
      console.log("🔵 Agent ID:", agentId);
      console.log("🔵 Request body:", JSON.stringify(body, null, 2));

      const { jsonrpc, id: requestId, method, params } = body;

      // Validate JSON-RPC 2.0 format
      if (jsonrpc !== "2.0" || !requestId) {
        console.log("❌ Invalid JSON-RPC format");
        return c.json({
          jsonrpc: "2.0",
          id: requestId || null,
          error: {
            code: -32600,
            message: 'Invalid Request: jsonrpc must be "2.0" and id is required',
          },
        }, 400);
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        console.log("❌ Agent not found:", agentId);
        return c.json({
          jsonrpc: "2.0",
          id: requestId,
          error: {
            code: -32602,
            message: `Agent '${agentId}' not found`,
          },
        }, 404);
      }

      console.log("✅ Agent found, extracting messages...");

      // Extract messages from params
      const { message, messages, contextId, taskId, metadata } = params || {};

      let messagesList = [];
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      }

      console.log("🔵 Messages list:", messagesList);

      // Convert A2A messages to Mastra format
      const mastraMessages = messagesList.map((msg: any) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((part: any) => {
              if (part.kind === "text") return part.text;
              if (part.kind === "data") return JSON.stringify(part.data);
              return "";
            })
            .join("\n") || "",
      }));

      console.log("🔵 Calling agent.generate with:", mastraMessages);

      // Execute agent
      const response = await agent.generate(mastraMessages);
      console.log("✅ Agent response received:", response.text);
      const agentText = response.text || "";

      // Build artifacts array
      // Build artifacts array
const artifacts: any[] = [
  {
    artifactId: randomUUID(),
    name: `${agentId}Response`,
    parts: [{ kind: "text", text: agentText }],
  },
];

      // Add tool results as artifacts
      if (response.toolResults && response.toolResults.length > 0) {
        console.log("🔵 Tool results:", response.toolResults);
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          parts: response.toolResults.map((result: any) => ({
            kind: "data",
            data: result,
          })),
        });
      }

      // Build conversation history
      const history = [
        ...messagesList.map((msg: any) => ({
          kind: "message",
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: "message",
          role: "agent",
          parts: [{ kind: "text", text: agentText }],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        },
      ];

      console.log("✅ Sending A2A response");

      // Return A2A-compliant response
      return c.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),
          status: {
            state: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [{ kind: "text", text: agentText }],
              kind: "message",
            },
          },
          artifacts,
          history,
          kind: "task",
        },
      });
    } catch (error: any) {
      console.error("❌ Error in A2A handler:", error);
      return c.json({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
          data: { details: error.message },
        },
      }, 500);
    }
  }
});