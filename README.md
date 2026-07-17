# MatchMind AI 🧠 — Your Friendly Resume & Job Helper

[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF.svg?style=flat-or-square&logo=vite)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?style=flat-or-square&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC.svg?style=flat-or-square&logo=tailwind-css)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Enabled-00C4CC.svg?style=flat-or-square&logo=google-gemini)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=flat-or-square)](https://opensource.org/licenses/Apache-2.0)

**MatchMind AI** is a warm, supportive, and easy-to-understand resume reader and job helper. It takes the stress out of hiring and job seeking by turning complex, messy resumes into clean, human-readable insights. Powered by Google's Gemini AI, MatchMind helps you instantly see how well a candidate fits a job opening, what skills they have, what they might be missing, and how to start a great, friendly conversation during an interview.

---

## ✨ Friendly Core Features

Designed to be incredibly simple and approachable for recruiters, hiring managers, and job seekers alike:

*   **🔍 Smart Resume Reading (Gemini AI)**: Paste or upload any plain-text resume, and our friendly helper automatically extracts core details like contact info, key skills, work history, and highest degree without the usual technical jargon.
*   **🤝 Friendly Skills Check & Score**: See how well a candidate aligns with your job opening. It computes a clear, percentage-based score and tells you exactly what skills match and which ones might be worth learning next.
*   **⚔️ Side-by-Side Candidate Battle**: Need to compare two great candidates? View them side-by-side with encouraging, helpful feedback highlighting each person's unique strengths and differentiators.
*   **🪄 Tailored Resume Optimizer**: Job seekers can get positive, down-to-earth feedback and practical rewrites for their resume bullet points to help highlight their experience in the best light.
*   **💬 Custom Conversational Questions**: Automatically generates three warm, tailored, and approachable interview questions to help you start a relaxed, meaningful dialogue.
*   **📊 Market Skills & Trends**: A visual dashboard summarizing what skills are in high demand versus what's currently plentiful in your talent pool, helping you bridge gaps easily.

---

## 📐 How the Scoring Works (Simple & Balanced)

We believe matching shouldn't be a cold, rigid calculation. MatchMind AI uses a friendly, balanced hybrid score that values both direct keywords and conceptual meaning:

1.  **Core Skill Keyword Match (60% Weight)**:
    We compare the exact skills listed in the job opening against what the candidate has.
    
    $$\text{Keyword Match} = \frac{\text{Skills Match Count}}{\text{Skills Requested Count}}$$
    
    *We only divide by what the job asks for. Having extra skills is a wonderful bonus and never penalizes the candidate!*

2.  **AI Meaning & Concept Match (40% Weight)**:
    Using advanced AI understanding, we check if the candidate has equivalent or related experience (for instance, recognizing that someone with `PyTorch` has strong `Deep Learning` experience, even if they didn't write those exact words).

$${\text{Final Score}} = (60\% \times \text{Keyword Match}) + (40\% \times \text{AI Meaning Match})$$

This creates a warm, holistic match percentage that highlights potential rather than just scanning for exact keywords!

---

## 🛠️ Technology Stack & Under-the-Hood Tools

| Layer | Technology | Why We Use It |
| :--- | :--- | :--- |
| **Language Runtime** | **TypeScript** | Ensures absolute code safety, reliable variables, and smooth modern Javascript execution. |
| **Frontend Framework** | **React 19 + Vite 6** | Ultra-lean, lightning-fast rendering cycles, and an incredibly responsive interface. |
| **Styling & Theme** | **Tailwind CSS v4** | Clean, minimalist, modern look with soft typography, comfortable spacing, and beautiful custom animations. |
| **Icons & Motion** | **Lucide Icons & Motion** | Elegant iconography paired with subtle, warm transitions that make the app feel alive and inviting. |
| **Backend API** | **Express.js (Node.js)** | A simple, robust server that safely proxies AI requests and keeps credentials secure. |
| **Artificial Intelligence** | **Google Gen AI SDK (`@google/genai`)** | Easily integrates with **Gemini 3.5 Flash** for quick, friendly, and structured JSON summaries. |
| **Local Database** | **Durable JSON File DB** | Automatically saves your candidates and job openings locally so you never lose your work. |

---

## 🚀 Getting Started (Quick Launch)

Follow these simple steps to run MatchMind AI on your own computer:

### 📋 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: A valid API key from [Google AI Studio](https://aistudio.google.com/)

### ⚙️ Build and Run Commands

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/MatchMind-AI.git
    cd MatchMind-AI
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Your API Key**:
    Copy the example environment file and insert your Gemini API Key:
    ```bash
    cp .env.example .env
    ```
    Open `.env` in your text editor and add your key:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Start in Development Mode**:
    ```bash
    npm run dev
    ```
    Now, open [http://localhost:3000](http://localhost:3000) in your browser!

5.  **Build and Run for Production**:
    ```bash
    # Build the optimized production bundle
    npm run build
    
    # Start the fast production server
    npm run start
    ```

---

## 📁 Repository Directory Map

Here is an easy-to-read layout of where everything lives in the project:

```text
MatchMind-AI/
├── app/                      # Optional Python service modules
├── data/
│   └── db.json               # Local database file (automatically saves your data)
├── src/                      # Frontend Application
│   ├── components/           # Extracted UI widgets and sub-layouts
│   ├── types.ts              # Type definitions and interface boundaries
│   ├── App.tsx               # Main, beautiful dashboard layout & interactive pages
│   ├── index.css             # Tailwind v4 import & font configurations
│   └── main.tsx              # React entry mount point
├── .env.example              # Example environment configuration
├── server.ts                 # Full-stack backend Express app and Gemini API controller
├── tsconfig.json             # TypeScript project settings
├── package.json              # Script shortcuts and project package dependencies
└── README.md                 # This friendly guide!
```

---

## 🔮 Looking Ahead: Future Scaling (PostgreSQL + pgvector)

If your talent pool grows to tens of thousands of resumes, you can easily scale MatchMind AI to a production database like PostgreSQL with **Drizzle ORM** and **pgvector** for lightning-fast matching.

### 1. Database Schema (`src/db/schema.ts`)
```typescript
import { pgTable, text, timestamp, integer, uuid, vector } from 'drizzle-orm/pg-core';

export const candidates = pgTable('candidates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  skills: text('skills').array().notNull(), 
  predictedRole: text('predicted_role').notNull(),
  resumeText: text('resume_text').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // High-dimensional vector space
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  text: text('text').notNull(),
  requiredSkills: text('required_skills').array().notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  createdAt: timestamp('created_at').defaultNow().notNull()
});
```

### 2. High-Performance HNSW Vector Querying
You can run fast queries using **pgvector's HNSW index** to order candidates based on how close their experience vector is to your job description:

```sql
-- Create an index for quick cosine similarity matching
CREATE INDEX candidate_hnsw_idx 
ON candidates 
USING hnsw (embedding vector_cosine_ops);

-- Find the top 10 best matching candidates for a job
SELECT 
  id, 
  name, 
  predicted_role,
  1 - (embedding <=> :job_embedding) AS cosine_similarity
FROM candidates
ORDER BY embedding <=> :job_embedding
LIMIT 10;
```

---

## ⚖️ License & Open Source

This project is friendly and open-source under the **Apache 2.0 License**. Feel free to use, modify, and build upon it!

*Created with care, attention to detail, and a desire to make hiring supportive and simple.*
