import {
  gemini,
  createAgent,
  createTool,
  createNetwork,
  Tool,
  type Message,
  createState,
  openai,
} from "@inngest/agent-kit";
import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter"
import { getSandbox } from "./utils";


export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async()=>{
      const sandbox = await Sandbox.create("vibe-nextjs-test-0000")
      return sandbox.sandboxId;
    })
     // Create a new agent with a system prompt (you can add optional tools, too)
    const codeagent = createAgent({
      name: "writer",
      system: "You are an expert next.js developer.  You write readable, maintainable code.you write simple next.js snippets ,like Button && React snippets",
      model: gemini({model : "gemini-2.0-flash"}),
    });

    const { output } = await codeagent.run(
  `Write the following snippet : ${event.data.email}`,);

const sandboxUrl = await step.run("get-sandbox-url", async()=>{
    const sandbox = await getSandbox(sandboxId);
    const host = sandbox.getHost(3000);
    return `https://${host}`;
  })

    return { output , sandboxUrl };
  },
);