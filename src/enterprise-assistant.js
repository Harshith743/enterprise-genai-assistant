import "dotenv/config"; // Load environment variables
import fs from "fs/promises";
import path from "path";

import { RecursiveCharacterTextSplitter } from "./text-splitters/RecursiveCharacterTextSplitter.js";
import { LlamaCpp } from "./llms/LlamaCpp.js";
import { PDFLoader } from "./loaders/PDFLoader.js";

/**
 * Configuration
 */
const CONFIG = {
  documentsPath: process.env.DOCS_PATH || "./examples/enterprise_docs",
  chunkSize: parseInt(process.env.CHUNK_SIZE || "500"),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "50"),
  maxContextChunks: parseInt(process.env.MAX_CONTEXT_CHUNKS || "3"),
  modelPath: process.env.MODEL_PATH || "./models/hf_Qwen_Qwen3-1.7B.Q8_0.gguf",
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

    if (file.endsWith(".txt")) {
      console.log(`Loading text file: ${file}`);
      const text = await fs.readFile(fullPath, "utf-8");
      texts.push(text);
    } else if (file.endsWith(".pdf")) {
      console.log(`Loading PDF file: ${file}`);
      try {
        const loader = new PDFLoader(fullPath);
        const docs = await loader.load();
        // PDFLoader returns an array of documents, join their text
        const text = docs.map((d) => d.text).join("\n\n");
        texts.push(text);
      } catch (err) {
        console.error(`Failed to load PDF ${file}:`, err);
      }
    }
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
/**
 * Run Enterprise Assistant in Interactive Mode
 */
async function main() {
  // 1. Initialize Context (Load Docs & Split) ONCE
  const contextChunks = await buildContextChunks();

  // 2. Initialize LLM ONCE
  console.log("🤖 Loading LLM model...");
  const llm = await LlamaCpp.initialize({
    modelPath: CONFIG.modelPath,
  });
  console.log("✅ LLM Loaded!");

  // 3. Start Interactive Loop
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n💬 Enterprise Assistant Ready! (Type 'exit' to quit)");
  console.log("----------------------------------------------------");

  const askQuestion = () => {
    rl.question("\n📝 You: ", async (query) => {
      if (query.trim().toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        process.exit(0);
      }

      if (!query.trim()) {
        console.log("⚠️ Please enter a valid query.");
        askQuestion();
        return;
      }

      // Build context for this specific query
      // (In a real vector DB scenario, we would retrieve relevant chunks here)
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

      process.stdout.write("🤖 AI: ");
      try {
        const response = await llm.invoke(finalPrompt);
        console.log(response);
      } catch (err) {
        console.error("❌ Error generating response:", err);
      }

      askQuestion(); // Loop back
    });
  };

  // Start the loop
  askQuestion();
}

/**
 * Start the application
 */
import readline from "readline";

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
});
