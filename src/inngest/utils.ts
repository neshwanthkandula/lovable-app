import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, Message, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandboxId: string) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}

export const parseAgentOutput = (value: any): string => {
  // Handle string input directly
  if (typeof value === "string") {
    return value;
  }

  // Handle array of Messages (from agent output)
  if (Array.isArray(value)) {
    const output = value[0];
    
    if (!output) {
      return "Fragment";
    }

    if (output.type !== "text") {
      return "Fragment";
    }

    if (Array.isArray(output.content)) {
      return output.content.map((txt: any) => txt.text || txt).join("");
    } else {
      return output.content || "Fragment";
    }
  }

  // Handle single Message object
  if (value && typeof value === "object") {
    if (value.type === "text") {
      if (Array.isArray(value.content)) {
        return value.content.map((txt: any) => txt.text || txt).join("");
      } else {
        return value.content || "Fragment";
      }
    }
  }

  return "Fragment";
};