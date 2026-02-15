# Project Setup & Requirements

This guide helps new users set up the Enterprise GenAI Assistant from scratch.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
*   **Node.js**: Version 18 or higher (Recommended: v20 LTS)
*   **npm**: Comes installed with Node.js

## 🚀 Installation

### 1. Install Dependencies
This project uses Node.js. All dependencies are listed in `package.json`.

```bash
npm install
```

### 2. Download Models
You need two GGUF models: one for **Embeddings** (retrieval) and one for **Generation** (LLM).

#### A. Embedding Model (Required)
Downloads `bge-small-en-v1.5.Q8_0.gguf` for semantic search.

```bash
npx node-llama-cpp pull --url https://huggingface.co/ChristianAzinn/bge-small-en-v1.5-gguf/resolve/main/bge-small-en-v1.5.Q8_0.gguf --dir models
```

#### B. LLM Model (Required)
Downloads `Qwen3-1.7B-Q8_0.gguf` for text generation.

```bash
npx --no node-llama-cpp pull --dir ./models hf:Qwen/Qwen3-1.7B-GGUF:Q8_0
```

*Note: You can use other models (e.g., Llama-3, DeepSeek) by downloading them to the `models/` directory and updating `src/enterprise-assistant.js`.*

## ▶️ Running the Application

Once dependencies and models are installed:

```bash
npm start
```

## 📄 Adding Documents
Place your `.txt` or `.pdf` files in the `examples/enterprise_docs/` directory. The assistant will automatically ingest and index them on startup.
