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
import { Command } from "lucide-react";
import {z } from "zod"
import { PROMPT } from "@/prompt";
import { prettyPrintLastAssistantMessage, lastAssistantTextMessageContent } from "@/inngest/utils"
import { prisma } from "../../lib/prisma";

interface AgentState {
  summary : string,
  files : { [path : string] : string}
};

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async()=>{
      const sandbox = await Sandbox.create("vibe-nextjs-test-0000")
      return sandbox.sandboxId;
    })

    const codeagent = createAgent<AgentState>({
      name: "code-agent",
      description : "An expert coding agent",
      system: PROMPT,
      model: gemini({model : "gemini-2.0-flash"}),
      tools: [
      // terminal use
      createTool({
        name: "terminal",
        description: "Use the terminal to run commands",
        parameters: z.object({
          command: z.string(),
        }),
        handler: async ({ command }, { network }) => {
          const buffers = { stdout: "", stderr: "" };

          try {
            const sandbox = await getSandbox(sandboxId);
            const result = await sandbox.commands.run(command, {
              onStdout: (data: string) => {
                buffers.stdout += data;
              },
              onStderr: (data: string) => {
                buffers.stderr += data;
              },
            });
            return result.stdout;
          } catch (e) {
            console.error(
              `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`
            );
            return `Command failed: ${e} \nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
          }
        },
      }),
      // create or update file
      createTool({
        name: "createOrUpdateFiles",
        description: "Create or update files in the sandbox",
        parameters: z.object({
          files: z.array(
            z.object({
              path: z.string(),
              content: z.string(),
            })
          ),
        }),
        handler: async ({ files }, { network } : Tool.Options<AgentState>) => {
          try {
            const sandbox = await getSandbox(sandboxId);
            for (const file of files) {
              await sandbox.files.write(file.path, file.content);
            }
            network.state.data.files = Object.fromEntries(
              files.map(f => [f.path, f.content])
            );


            return `Files created or updated: ${files
              .map((f) => f.path)
              .join(", ")}`;
          } catch (e) {
            return "Error: " + e;
          }
        },
      }),

      //read file
      createTool({
        name: "readFiles",
        description: "Read files from the sandbox",
        parameters: z.object({
          files: z.array(z.string()),
        }),
        handler: async ({ files }, { network }) => {
          console.log("readFiles <", files);
          try {
            const sandbox = await getSandbox(sandboxId);
            const contents = [];
            for (const file of files) {
              const content = await sandbox.files.read(file);
              contents.push({ path: file, content });
            }
            return JSON.stringify(contents);
          } catch (e) {
            console.error("error", e);
            return "Error: " + e;
          }
        },
      }),
    ],

    lifecycle: {
      onResponse: async ({ result, network }) => {
        // prettyPrintLastAssistantMessage(result);

        const lastAssistantMessageText =
          lastAssistantTextMessageContent(result);

        if (lastAssistantMessageText && network) {
          if (lastAssistantMessageText.includes("<task_summary>")) {
            network.state.data.summary =  lastAssistantMessageText ;

          }
        }

        return result;
      },
    },

    });

      const network = createNetwork<AgentState>({
        name: "coding-agent-network",
        agents: [codeagent],
        maxIter: 15,
        router: ({ network }) => {
          const summary = network.state.data.summary;

          if(summary){
            return ;
          }

          return codeagent;
        },
      });


    const result = await network.run(event.data.email);


    const sandboxUrl = await step.run("get-sandbox-url", async()=>{
    const sandbox = await getSandbox(sandboxId);
    const host = sandbox.getHost(3000);
    return `https://${host}`;
  })

  await step.run("save-result", async()=>{
    return await prisma.message.create({
      data : {
        content : result.state.data.summary,
        role : "ASSISTANT",
        type : "RESULT",
        fragment : {
          create : {
            sandboxUrl : sandboxUrl,
            title : "Fragment",
            file : result.state.data.files,
          }
        }
      }
    })
  })
    return { 
      url : sandboxUrl, 
      title :  " Fragments",
      files : result.state.data.files,
      summary : result.state.data.summary,
    };
  },
);