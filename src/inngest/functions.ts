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
import { getSandbox, parseAgentOutput, lastAssistantTextMessageContent } from "./utils";
import {z } from "zod"
import { PROMPT } from "@/prompt";
import { FRAGMENT_TITLE_PROMPT, RESPONSE_PROMPT } from "@/Betterprompt";
import { prisma } from "../../lib/prisma";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("vibe-nextjs-test-0000");
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-preview-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        for (const message of messages) {
          formattedMessages.push({
            type: "text",
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content,
          });
        }

        return formattedMessages.reverse();
      },
    );

    const state = createState<AgentState>(
      {
        summary: "",
        files: {},
      },
      {
        messages: previousMessages,
      },
    );

    const codeagent = createAgent<AgentState>({
      name: "code-agent",
      description: "An expert coding agent",
      system: PROMPT,
      model: gemini({ model: "gemini-2.0-flash" }),
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
              return result.stdout || "Command executed successfully";
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
          handler: async ({ files }, { network }: Tool.Options<AgentState>) => {
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
        // read file
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
          const lastAssistantMessageText = lastAssistantTextMessageContent(result);

          if (lastAssistantMessageText && network) {
            // Extract only the content between <task_summary> tags
            const summaryMatch = lastAssistantMessageText.match(/<task_summary>(.*?)<\/task_summary>/);
            if (summaryMatch && summaryMatch[1]) {
              network.state.data.summary = summaryMatch[1].trim();
            } else if (lastAssistantMessageText.includes("<task_summary>")) {
              // If closing tag is missing, extract everything after opening tag
              const partialSummary = lastAssistantMessageText.split('<task_summary>')[1];
              if (partialSummary) {
                network.state.data.summary = partialSummary.trim();
              }
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

        // Stop if we have a summary OR reached max iterations
        if ((summary && summary.length > 0)) {
          return;
        }

        return codeagent;
      },
    });

    const result = await network.run(event.data.value);

    // Safe state access with fallbacks
    const summary = result?.state?.data?.summary || "No summary generated";
    const files = result?.state?.data?.files || {};

    console.log("Network execution completed:", {
      hasSummary: !!result?.state?.data?.summary,
      summaryLength: summary.length,
      filesCount: Object.keys(files).length
    });

    const fragmeTitleGenerator = createAgent({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: gemini({
        model: "gemini-2.0-flash-lite",
      }),
    });

    const responseGenerator = createAgent({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: gemini({
        model: "gemini-2.0-flash-lite",
      }),
    });

    // Safe agent execution with error handling
    let fragmentTitleOutput: string;
    let responseOutput: string;

    try {
      const titleResult = await fragmeTitleGenerator.run(summary);
      fragmentTitleOutput = parseAgentOutput(titleResult.output);
    } catch (error) {
      console.error("Error generating fragment title:", error);
      fragmentTitleOutput = "Untitled Fragment";
    }

    try {
      const responseResult = await responseGenerator.run(summary);
      responseOutput = parseAgentOutput(responseResult.output);
    } catch (error) {
      console.error("Error generating response:", error);
      responseOutput = "I've worked on your request. Check the sandbox to see the results.";
    }

    const isError = !summary || summary === "No summary generated" || Object.keys(files).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await getSandbox(sandboxId);
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again.",
            role: "ASSISTANT",
            type: "ERROR"
          }
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: responseOutput,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandboxUrl: sandboxUrl,
              title: fragmentTitleOutput,
              files: files,
            }
          }
        }
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragments",
      files: files,
      summary: summary,
    };
  },
);