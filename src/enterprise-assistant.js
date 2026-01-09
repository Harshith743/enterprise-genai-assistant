import fs from "fs/promises";
import path from "path";

import { RecursiveCharacterTextSplitter } from "./text-splitters/RecursiveCharacterTextSplitter.js";
import { LlamaCpp } from "./llms/LlamaCpp.js";

/**
 * Configuration
 */
const CONFIG = {
  documentsPath: "./examples/enterprise_docs",
  chunkSize: 500,
  chunkOverlap: 50,
  maxContextChunks: 3,
  modelPath: "./models/hf_Qwen_Qwen3-1.7B.Q8_0.gguf",
};

/**
 * Load raw text documents
 */
async function loadDocuments(dirPath) {
  const files = await fs.readdir(dirPath);
  const texts = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) continue;

    const text = await fs.readFile(fullPath, "utf-8");
    texts.push(text);
  }

  return texts;
}

/**
 * Build context chunks
 */
async function buildContextChunks() {
  console.log("📄 Loading enterprise documents...");
  const documents = await loadDocuments(CONFIG.documentsPath);
  console.log(`✅ Loaded ${documents.length} documents`);

  console.log("✂️ Splitting documents into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.chunkSize,
    chunkOverlap: CONFIG.chunkOverlap,
  });

  const combinedText = documents.join("\n");
  const chunks = await splitter.splitText(combinedText);

  console.log(`✅ Created ${chunks.length} chunks`);

  return chunks.slice(0, CONFIG.maxContextChunks);
}

/**
 * Run Enterprise Assistant
 */
async function runEnterpriseAssistant(query) {
  const contextChunks = await buildContextChunks();

  const context = contextChunks
    .map((chunk, i) => `Context ${i + 1}:\n${chunk}`)
    .join("\n\n");

  const finalPrompt = `
You are an enterprise AI assistant.
Answer the question using ONLY the context below.

${context}

Question: ${query}
Answer:
`.trim();

  console.log("\n❓ User Query:");
  console.log(query);

  // ✅ CORRECT initialization
  const llm = await LlamaCpp.initialize({
    modelPath: CONFIG.modelPath,
  });

  const response = await llm.invoke(finalPrompt);

  console.log("\n💡 Answer:");
  console.log(response);
}

/**
 * Example run
 */
runEnterpriseAssistant(
  "Summarize the information available in the enterprise documents."
).catch((err) => {
  console.error("❌ Error running enterprise assistant:", err);
});
