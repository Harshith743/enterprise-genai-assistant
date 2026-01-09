import { LlamaCpp } from "../llms/LlamaCpp.js";

/**
 * ChatLlamaCpp
 * Thin wrapper that ALWAYS passes a prompt string to LlamaCpp
 */
export class ChatLlamaCpp extends LlamaCpp {
  async invoke(input, options = {}) {
    let prompt;

    // Case 1: raw string
    if (typeof input === "string") {
      prompt = input;
    }

    // Case 2: { prompt: "..." }
    else if (typeof input === "object" && input.prompt) {
      prompt = input.prompt;
    }

    // Case 3: chat-style messages array
    else if (Array.isArray(input)) {
      prompt = input
        .map(
          (msg) =>
            `${msg.role ?? "user"}: ${msg.content ?? String(msg)}`
        )
        .join("\n");
    } else {
      throw new Error("Unsupported input type for ChatLlamaCpp.invoke");
    }

    // ✅ THIS is the only correct call
    return super.invoke(prompt, options);
  }
}
