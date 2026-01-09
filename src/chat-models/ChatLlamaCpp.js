import { LlamaCpp } from '../llms/LlamaCpp.js';
import { ChatUserMessage } from 'node-llama-cpp';

/**
 * Chat-optimized version of LlamaCpp
 * Compatible with latest node-llama-cpp versions
 */
export class ChatLlamaCpp extends LlamaCpp {
  /**
   * Convert chat messages to a prompt and invoke the base LLM
   */
  async invoke(messages, options = {}) {
    const prompt = this._formatMessagesToPrompt(messages);

    const responseText = await super.invoke(prompt, options);

    // Return a plain object instead of ChatModelResponse
    // (RAGChain expects a simple { content } shape)
    return {
      content: responseText,
    };
  }

  /**
   * Format chat messages into a single prompt string
   */
  _formatMessagesToPrompt(messages) {
    if (typeof messages === 'string') {
      return messages;
    }

    return messages
      .map((msg) => {
        // Handle ChatUserMessage or plain objects safely
        const role = msg.role || 'user';
        const content =
          msg.content ??
          (msg instanceof ChatUserMessage ? msg.message : String(msg));

        return `${role}: ${content}`;
      })
      .join('\n');
  }
}
