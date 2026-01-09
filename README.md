# Enterprise GenAI Assistant (Local RAG-style)

An **Enterprise GenAI Assistant** built using **local LLM inference (llama.cpp + GGUF models)** that can ingest enterprise documents, split them into context chunks, and generate **context-aware answers** without relying on external APIs such as OpenAI.

This project focuses on **reliability, privacy, and explainability**, and demonstrates practical GenAI system design rather than a black-box API wrapper.

---

## 🚀 Key Features

- 📄 **Enterprise document ingestion** (text-based documents)
- ✂️ **Configurable text chunking** for long documents
- 🧠 **Context-augmented generation (RAG-style baseline)**
- 🔒 **Fully local inference** using GGUF models (no data leaves the machine)
- ⚙️ **No external API dependency**
- 🧩 Clean, modular architecture suitable for extension (vector DB, hybrid search, etc.)

---

## 🏗️ Architecture Overview

```
Documents (.txt)
      ↓
Text Loader
      ↓
Text Splitter (chunking)
      ↓
Context Selection (top-N chunks)
      ↓
Prompt Construction
      ↓
Local LLaMA Inference (llama.cpp)
      ↓
Generated Answer
```

> **Note:** This project implements a **robust RAG baseline**. Vector database integration (Qdrant / LanceDB / FAISS) can be added later as an enhancement.

---

## 📂 Project Structure

```
enterprise-genai-assistant/
│
├── src/
│   ├── enterprise-assistant.js   # Main entry point
│   ├── llms/                      # LLM wrappers (LlamaCpp)
│   ├── text-splitters/            # Chunking logic
│   └── utils/
│
├── examples/
│   └── enterprise_docs/           # Input documents (.txt files)
│
├── models/                        # GGUF model files
├── package.json
└── README.md
```

---

## ⚙️ Requirements

- **Node.js** >= 18
- **npm** or **pnpm**
- A **GGUF LLM model** compatible with `llama.cpp`
- Minimum **8GB RAM** recommended for 1–3B models

---

## 🤖 Supported Models (Examples)

You can use any GGUF model supported by `node-llama-cpp`.

Examples:
- `Qwen3-1.7B-Q8_0.gguf`
- `Llama-3.2-1B-Instruct.gguf`

> Smaller models are recommended for laptops.

---

## 📥 Setup Instructions

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

### 4️⃣ Add enterprise documents

Place your documents inside:

```
examples/enterprise_docs/
```

Supported format:
- `.txt`

Example:
```
examples/enterprise_docs/
├── company_policy.txt
├── internal_guidelines.txt
```

---

### 5️⃣ Configure model path

Open `src/enterprise-assistant.js` and update:

```js
modelPath: "./models/Qwen3-1.7B-Q8_0.gguf",
```

Make sure this matches the **exact filename** in your `models/` directory.

---

## ▶️ How to Run

```bash
node src/enterprise-assistant.js
```

### Example Output

```
📄 Loading enterprise documents...
✅ Loaded 2 documents
✂️ Splitting documents into chunks...
✅ Created 344 chunks

❓ User Query:
Summarize the information available in the enterprise documents.

💡 Answer:
<Generated summary>
```

---

## 🧠 How It Works (Detailed)

1. **Loads enterprise documents** from a directory
2. **Splits text into overlapping chunks** to fit LLM context limits
3. **Selects top-N chunks** as context (baseline retrieval)
4. **Constructs a grounded prompt** using selected context
5. **Runs local LLM inference** using llama.cpp

This approach provides a **transparent and explainable RAG-style pipeline**.

---

## 🔐 Privacy & Security

- No external API calls
- No document data leaves the system
- Suitable for enterprise / internal knowledge use cases

---

## 🚧 Limitations

- No vector database (yet)
- Retrieval is heuristic-based (top-N chunks)
- Supports text documents only

These are **intentional design choices** for clarity and stability.

---

## 🔮 Future Improvements

- Vector database integration (Qdrant / LanceDB)
- Semantic retrieval + re-ranking
- PDF and DOCX loaders
- Streaming responses
- Web UI

---

## 📌 Resume Description

> **Enterprise GenAI Assistant**  
> Built a document-grounded GenAI assistant using local LLaMA (GGUF) inference. Implemented enterprise document ingestion, configurable text chunking, and context-aware response generation without relying on external APIs. Focused on privacy, reliability, and explainable system design.

---

## 📄 License

MIT License

---

## 👤 Author

**Harshith Reddy T**  
GitHub: https://github.com/Harshith743

---

⭐ If you found this project useful, feel free to star the repository.

