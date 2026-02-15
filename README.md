# Enterprise GenAI Assistant (Local RAG-style)

An **Enterprise GenAI Assistant** built using **local LLM inference (llama.cpp + GGUF models)** that can ingest enterprise documents, split them into context chunks, and generate **context-aware answers** without relying on external APIs such as OpenAI.

This project focuses on **reliability, privacy, and explainability**, and demonstrates practical GenAI system design rather than a black-box API wrapper.

---

## Key Features

- **Enterprise document ingestion** (text-based documents, PDFs)
- **Configurable text chunking** for long documents
- **Full Semantic Search (RAG) using Embeddings**
- **Fully local inference** using GGUF models (no data leaves the machine)
- **No external API dependency**
- Clean, modular architecture suitable for extension

---

## Architecture Overview

```
Documents (.txt, .pdf)
      ↓
Text Loader (Text/PDF)
      ↓
Text Splitter (chunking)
      ↓
Embedding Generation (Local Model)
      ↓
Vector Store (In-Memory)
      ↓
Semantic Retrieval (Top-K Match)
      ↓
Prompt Construction
      ↓
Local LLaMA Inference (llama.cpp)
      ↓
Generated Answer
```

> **Note:** This project implements a **robust RAG system** with semantic search capabilities using local embeddings.

---

## Project Structure

```
enterprise-genai-assistant/
│
├── src/
│   ├── enterprise-assistant.js   # Main entry point
│   ├── llms/                      # LLM wrappers (LlamaCpp)
│   ├── loaders/                   # Document loaders (PDF, Text)
│   ├── text-splitters/            # Chunking logic
│   └── utils/
│
├── examples/
│   └── enterprise_docs/           # Input documents (.txt, .pdf files)
│
├── models/                        # GGUF model files
├── package.json
└── README.md
```

---

## Requirements

- **Node.js** >= 18
- **npm** or **pnpm**
- A **GGUF LLM model** compatible with `llama.cpp`
- A **GGUF Embedding model** (e.g., `bge-small`)
- Minimum **8GB RAM** recommended for 1–3B models

---

## Supported Models (Examples)

You can use any GGUF model supported by `node-llama-cpp`.

Examples:
- `Qwen3-1.7B-Q8_0.gguf`
- `Llama-3.2-1B-Instruct.gguf`

> Smaller models are recommended for laptops.

---

## Setup Instructions

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Harshith743/enterprise-genai-assistant.git
cd enterprise-genai-assistant
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Download a GGUF model

Example using `node-llama-cpp`:

```bash
npx node-llama-cpp pull hf:Qwen/Qwen3-1.7B-GGUF:Q8_0 --dir ./models
```

After download, ensure you have a file like:

```
models/Qwen3-1.7B-Q8_0.gguf
```

---

### 4️⃣ Download an Embedding model

You also need a model to convert text into vectors.

```bash
npx node-llama-cpp pull --url https://huggingface.co/ChristianAzinn/bge-small-en-v1.5-gguf/resolve/main/bge-small-en-v1.5.Q8_0.gguf --dir models
```

Ensure you have:

```
models/bge-small-en-v1.5-Q8_0.gguf
```

---

---

### 5️⃣ Add enterprise documents

Place your documents inside:

```
examples/enterprise_docs/
```

Supported formats:
- `.txt`
- `.pdf`

Example:
```
examples/enterprise_docs/
├── company_policy.txt
├── annual_report.pdf
├── internal_guidelines.txt
```

---

---

### 6️⃣ Configure model path

Open `src/enterprise-assistant.js` and update:

```js
modelPath: "./models/Qwen3-1.7B-Q8_0.gguf",
```

Make sure this matches the **exact filename** in your `models/` directory.

---

## ▶️ How to Run

```bash
npm start
```

### Example Output

```
📄 Loading enterprise documents...
Loading text file: company_policy.txt
Loading PDF file: annual_report.pdf
✅ Loaded 2 documents
✂️ Splitting documents into chunks...
✅ Created 344 chunks

❓ User Query:
Summarize the information available in the enterprise documents.

💡 Answer:
<Generated summary>
```

---

## How It Works (Detailed)

1. **Loads enterprise documents** from a directory (supports `.txt` and `.pdf`)
2. **Splits text into overlapping chunks** to fit LLM context limits
3. **Generates embeddings** for all chunks using a local model
4. **Retrieves top-K relevant chunks** based on semantic similarity to the query
5. **Constructs a grounded prompt** using selected context
6. **Runs local LLM inference** using llama.cpp

This approach provides a **transparent and explainable RAG-style pipeline**.

---

## Privacy & Security

- No external API calls
- No document data leaves the system
- Suitable for enterprise / internal knowledge use cases

---

## Limitations

- In-Memory Vector Store (vectors lost on restart)
- Retrieval is purely semantic (no keyword search yet)

These are **intentional design choices** for clarity and stability.

---

## Future Improvements

- Vector database integration (Qdrant / LanceDB)
- Semantic retrieval + re-ranking
- DOCX loader
- Streaming responses
- Web UI

---

## Description

> **Enterprise GenAI Assistant**  
> Built a document-grounded GenAI assistant using local LLaMA (GGUF) inference. Implemented enterprise document ingestion, configurable text chunking, and context-aware response generation without relying on external APIs. Focused on privacy, reliability, and explainable system design.

---

## License

The MIT License (MIT)
Copyright © 2026 <copyright holders>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Author

**Harshith Reddy T**  
GitHub: https://github.com/Harshith743

---

If you found this project useful, feel free to star the repository.

