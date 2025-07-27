# 🎥 Movie Chatbot AI

A locally‑run movie chatbot built with **Next.js**, **Ollama**, and **Qdrant**, using Retrieval‑Augmented Generation (RAG) plus optional scraping to enrich specific topics with external context.

## 🔍 Features

- **Next.js frontend + API routes** for chat UI and backend logic  
- **Ollama** for locally hosted LLM model  
- **Qdrant** as the vector database to store and retrieve embeddings via similarity search  
- **Web scraping module**: fetches and embeds fresh web content for additional context on demand  

## 🚀 Run Locally — Step by Step

### 1. Clone & Install

```bash
git clone https://github.com/rmmir/movie-chatbot.git
cd movie-chatbot
npm install
```

### 2. Install Ollama locally

- Download Ollama from: https://ollama.com/
- Pull the `llama3.1` and `nomic-embed-text` models
- Make sure Ollama runs locally via `ollama serve`

### 3. Start the qdrant server

```bash
npm run qdrant
```

You can check the database dashboard at `http://localhost:6333/dashboard`

### 4. Start the Next.js server and play around with the app

```bash
npm run dev
```
