import "dotenv/config";

import { DirectoryLoader } from "./loaders/DirectoryLoader.js";
import { RecursiveCharacterTextSplitter } from "./text-splitters/RecursiveCharacterTextSplitter.js";
import { InMemoryVectorStore } from "./vector-stores/InMemoryVectorStore.js";
import { VectorStoreRetriever } from "./retrievers/VectorStoreRetriever.js";
import { RAGChain } from "./chains/RAGChain.js";
import { OpenAIChatModel } from "./chat-models/OpenAIChatModel.js";

/**
 * Enterprise RAG Configuration
 */
const CONFIG = {
  documentsPath: "./examples/enterprise_docs",
  chunkSize: Number(process.env.CHUNK_SIZE || 500),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 50),
  topK: Number(process.env.TOP_K || 4),
};

/**
 * Build Enterprise Knowledge Base
 */
async function buildKnowledgeBase() {
  console.log("📄 Loading enterprise documents...");

  const loader = new DirectoryLoader(CONFIG.documentsPath);
  const enterpriseDocuments = await loader.load();

  console.log(`✅ Loaded ${enterpriseDocuments.length} documents`);

  console.log("✂️ Splitting documents into chunks...");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CONFIG.chunkSize,
    chunkOverlap: CONFIG.chunkOverlap,
  });

  const documentChunks = await splitter.splitDocuments(
    enterpriseDocuments
  );

  console.log(`✅ Created ${documentChunks.length} chunks`);

  console.log("📦 Building vector store...");
  const vectorStore = new InMemoryVectorStore();
  await vectorStore.addDocuments(documentChunks);

  return vectorStore;
}

/**
 * Run Enterprise Assistant
 */
async function runEnterpriseAssistant(userQuery) {
  const vectorStore = await buildKnowledgeBase();

  const retriever = new VectorStoreRetriever({
    vectorStore,
    topK: CONFIG.topK,
  });

  const llm = new OpenAIChatModel({
    model: "gpt-3.5-turbo",
  });

  const ragChain = new RAGChain({
    retriever,
    llm,
  });

  console.log("\n❓ User Query:");
  console.log(userQuery);

  const response = await ragChain.call({ query: userQuery });

  console.log("\n💡 Answer:");
  console.log(response.answer);

  console.log("\n📚 Sources:");
  response.sources.forEach((source, idx) => {
    console.log(`${idx + 1}. ${source.metadata.source}`);
  });
}

/**
 * Example Run
 */
runEnterpriseAssistant(
  "What information is available in the enterprise documents?"
);
