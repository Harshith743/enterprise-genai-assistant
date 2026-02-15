import "dotenv/config"; // Load environment variables
import fs from "fs/promises";
import path from "path";
import readline from "readline";

import { RecursiveCharacterTextSplitter } from "./text-splitters/RecursiveCharacterTextSplitter.js";
import { LlamaCpp } from "./llms/LlamaCpp.js";
import { PDFLoader } from "./loaders/PDFLoader.js";
import { EmbeddingModel } from "./embeddings/EmbeddingModel.js";
import { InMemoryVectorStore } from "./vector-stores/InMemoryVectorStore.js";
import { VectorStoreRetriever } from "./retrievers/VectorStoreRetriever.js";

/**
 * Configuration
 */
const CONFIG = {
  documentsPath: process.env.DOCS_PATH || "./examples/enterprise_docs",
  chunkSize: parseInt(process.env.CHUNK_SIZE || "500"),
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP || "50"),
  k: parseInt(process.env.RETRIEVAL_K || "4"), // Number of chunks to retrieve
  modelPath: process.env.MODEL_PATH || "./models/hf_Qwen_Qwen3-1.7B.Q8_0.gguf",
  embeddingModelPath: process.env.EMBEDDING_MODEL_PATH || "./models/bge-small-en-v1.5.Q8_0.gguf",
};

/**
 * Load raw text documents
 */
async function loadDocuments(dirPath) {
  const files = await fs.readdir(dirPath);
  const documents = [];

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) continue;

    if (file.endsWith(".txt")) {
      console.log(`Loading text file: ${file}`);
      const text = await fs.readFile(fullPath, "utf-8");
      documents.push({ text, metadata: { source: file } });
    } else if (file.endsWith(".pdf")) {
      console.log(`Loading PDF file: ${file}`);
      try {
        const loader = new PDFLoader(fullPath);
        const docs = await loader.load();
        // PDFLoader returns multiple docs (pages), we'll keep them associated with the source
        docs.forEach(d => {
          documents.push({ text: d.pageContent, metadata: { source: file, ...d.metadata } });
        });
      } catch (err) {
        console.error(`Failed to load PDF ${file}:`, err);
      }
    }
  }

  return documents;
}

/**
 * Build Vector Store
 */
async function buildVectorStore() {
  console.log("📄 Loading enterprise documents...");
  const rawDocs = await loadDocuments(CONFIG.documentsPath);
  console.log(`✅ Loaded ${rawDocs.length} document sources`);

  console.log("✂️ Splitting documents into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.chunkSize,
    chunkOverlap: CONFIG.chunkOverlap,
  });

  const chunkedDocs = [];

  for (const doc of rawDocs) {
    const chunks = await splitter.splitText(doc.text);
    chunks.forEach(chunk => {
      chunkedDocs.push({
        pageContent: chunk,
        metadata: doc.metadata
      });
    });
  }

  console.log(`✅ Created ${chunkedDocs.length} chunks`);

  console.log("🧠 Initializing Embedding Model...");
  const embeddingModel = new EmbeddingModel({
    modelPath: CONFIG.embeddingModelPath
  });
  await embeddingModel.initialize();

  console.log("💾 Creating Vector Store & Generating Embeddings (this may take a moment)...");
  const vectorStore = new InMemoryVectorStore(embeddingModel);
  await vectorStore.addDocuments(chunkedDocs);
  console.log("✅ Vector Store Ready!");

  return { vectorStore, embeddingModel };
}

/**
 * Enterprise Assistant Class
 * Encapsulates logic for loading, embedding, and querying documents.
 */
export class EnterpriseAssistant {
  constructor() {
    this.vectorStore = null;
    this.embeddingModel = null;
    this.retriever = null;
    this.llm = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the assistant
   */
  async initialize() {
    if (this.isInitialized) return;

    // 1. Initialize Vector Store (Load Docs, Split, Embed)
    const { vectorStore, embeddingModel } = await buildVectorStore();
    this.vectorStore = vectorStore;
    this.embeddingModel = embeddingModel;

    // 2. Initialize Retriever
    this.retriever = new VectorStoreRetriever(vectorStore, embeddingModel);
    this.retriever.k = CONFIG.k;

    // 3. Initialize LLM
    console.log("🤖 Loading LLM model...");
    this.llm = await LlamaCpp.initialize({
      modelPath: CONFIG.modelPath,
    });
    console.log("✅ LLM Loaded!");

    this.isInitialized = true;
  }

  /**
   * Chat with the assistant
   * @param {string} query - User question
   * @returns {Promise<string>} - Assistant response
   */
  async chat(query) {
    if (!this.isInitialized) throw new Error("Assistant not initialized!");

    // Retrieve relevant chunks dynamically
    console.log(`🔍 Retrieving relevant context for: "${query}"`);
    const relevantDocs = await this.retriever.getRelevantDocuments(query);

    const context = relevantDocs
      .map((doc, i) => `Context ${i + 1} (Source: ${doc.metadata.source}):\n${doc.content}`)
      .join("\n\n");

    const finalPrompt = `
You are an enterprise AI assistant.
Answer the question using ONLY the context below.

${context}

Question: ${query}
Answer:
`.trim();

    const response = await this.llm.invoke(finalPrompt);
    return response;
  }
}

/**
 * Run Enterprise Assistant in Interactive Mode (CLI)
 */
async function main() {
  const assistant = new EnterpriseAssistant();
  await assistant.initialize();

  // 4. Start Interactive Loop
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

      process.stdout.write("🤖 AI: ");
      try {
        const response = await assistant.chat(query);
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
 * Start the application if run directly
 */
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error("❌ Fatal Error:", err);
  });
}
