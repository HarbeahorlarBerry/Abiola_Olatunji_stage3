🧠 TaskBuddy — Mastra A2A Task Manager

TaskBuddy is an AI-powered task management agent built using Mastra A2A, Google Gemini, and custom agent tools.
It supports creating and listing tasks through an Agent-to-Agent (A2A) endpoint.

🚀 Features

✅ Create tasks with optional due dates
✅ List existing tasks
✅ JSON-RPC 2.0 compatible A2A endpoint
✅ In-memory task store
✅ Clean Mastra agent + tool integration

🗂️ Project Structure
src/
 ├─ agents/
 │   └─ task-buddy.ts
 ├─ routes/
 │   └─ a2a-agent-routes.ts
 ├─ mastra.ts

🛠️ Tech Stack
Tool	Purpose
Mastra	Agent orchestration
Google Gemini	LLM
Zod	Tool input validation
Node.js	Runtime
🔧 TaskBuddy Architecture
flowchart TD

U[Client / Other Agent] -->|JSON-RPC request| A2A[/A2A Endpoint/]
A2A -->|forward| AG[TaskBuddy Agent]

AG -->|createTask tool| CT[Task Store]
AG -->|listTasks tool| CT

CT -->|results| AG
AG -->|final response| A2A
A2A --> U

📦 Installation
git clone https://github.com/HarbeahorlarBerry/Abiola_Olatunji_stage3
cd Abiola_Olatunji_stage3
npm install


Create .env and add:

GOOGLE_GENERATIVE_AI_API_KEY=your_key

▶️ Development
npm run dev


Production:

npm start

🔌 A2A Endpoint
URL
POST /a2a/agent/taskBuddy


✅ Hosted Example
https://abundant-rhythmic-fall-f46cbeb7-10e3-48d6-a489-c34c7301e91b.mastra.cloud/a2a/agent/taskBuddy

📄 Demo
✅ Create Task (JSON-RPC)
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "generate",
  "params": {
    "message": {
      "role": "user",
      "parts": [{ "kind": "text", "text": "Create task: Buy groceries tomorrow" }]
    }
  }
}

✅ List Tasks
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "generate",
  "params": {
    "message": {
      "role": "user",
      "parts": [{ "kind": "text", "text": "List tasks" }]
    }
  }
}

✨ Core Logic
🔹 Tools

✅ create-task
✅ list-tasks
Stored in memory:

taskStore[taskId] = {
  title,
  due,
  createdAt: new Date().toISOString(),
};

📄 Blog Post

🔗 https://dev.to/harbeahorlar_berry_e03970/building-taskbuddy-my-mastra-a2a-agent-for-task-management-2kpk

🐦 Twitter Post

🔗 https://x.com/LightningRod017/status/1986015390971892019?t=um03tQ0CTer6p1Zs92dXAA&s=19

📁 GitHub Repo

🔗 https://github.com/HarbeahorlarBerry/Abiola_Olatunji_stage3

✅ Future Improvements

Database persistence

Delete / update tasks

User-scoped task storage

📜 License

MIT