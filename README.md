# MatchMind AI: Enterprise-Grade Resume Screening & Job Matching System

An industrial-grade, full-stack Applicant Tracking System (ATS) and semantic NLP intelligence pipeline built with **React 19**, **Express.js**, **TypeScript**, and **Gemini 3.5**. **MatchMind AI** extracts structured, granular, validated databases from raw candidate resumes, automatically classifies candidate career domains, and computes weighted semantic suitability scores against complex, multi-layered job specifications.

---

## 🚀 Architectural Overview & High-Performance Workflow

```text
                                     [ HR Recruiter Dashboard (React 19 + Vite 6) ]
                                                           │
                                                           ▼ JSON / HTTPS
                                     [ High-Performance Node REST API Gateway ] 
                                                           │
                 ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                 │                                         │                                         │
                 ▼ (Parser Service)                        ▼ (Similarity Engine)                     ▼ (Data Persistence)
     ┌───────────────────────┐                 ┌───────────────────────┐                 ┌───────────────────────┐
     │  Gemini 3.5 LLM       │                 │  Weighted Soft Cosine │                 │  Durable SQLite-      │
     │  Structural Extractor │                 │  & Embedding Vector   │                 │  Mimicking JSON Store │
     └───────────┬───────────┘                 └───────────┬───────────┘                 └───────────┬───────────┘
                 │                                         │                                         │
                 ▼                                         ▼                                         ▼
   • Precise Skill Database Matrix           • Semantic Match Ratio %                  • Atomic Sync & Writes
   • Predicted Primary Domain Name           • Multi-Skill Match/Gaps Indicators       • Direct DB Query Layouts
   • Standardized Academic Credentials       • Contextual Gap Analysis Report          • ACID Transaction-
   • Unified Professional Chronology         • Dynamic Tailored Interview Qs             Simulating Engine
```

---

## 📐 Mathematical Formulation & Matching Logic

Modern ATS systems require deterministic, scalable math pipelines. MatchMind AI calculates job alignment using an advanced hybrid logic blending programmatic boolean overlap with semantic word-vector embeddings.

### 1. Hard Skill Alignment Heuristics (Weighted Jaccard Index)
The system calculates direct token-based skill convergence through:

$$\text{SkillMatch}(C, J) = \frac{|S_C \cap S_J|}{|S_J|}$$

Where:
- $S_C$ is the set of AI-extracted skills from the candidate's resume.
- $S_J$ is the set of required key-skills specified by the employer's Job Description.
- Unlike traditional Jaccard Indexing, we divide solely by $|S_J|$ because surplus candidate skills are valuable assets and must not penalize the normalized denominator score.

### 2. Semantic Similarity Score (Cosine Embedding Space)
To discover equivalent proficiencies (e.g., matching a candidate requesting `PyTorch` with a job demanding `Deep Learning`), the system proxies embeddings to measure directional vector similarity:

$$\text{Similarity}(\mathbf{v}_C, \mathbf{v}_J) = \cos(\theta) = \frac{\mathbf{v}_C \cdot \mathbf{v}_J}{\|\mathbf{v}_C\| \|\mathbf{v}_J\|} = \frac{\sum_{i=1}^{n} v_{C,i} v_{J,i}}{\sqrt{\sum_{i=1}^{n} v_{C,i}^2} \sqrt{\sum_{i=1}^{n} v_{J,i}^2}}$$

Where:
- $\mathbf{v}_C$ represents the dimensional latent vector representation of the candidate resume context.
- $\mathbf{v}_J$ represents the vector representation of the employer's target job requirement text block.
- The values are computed by projecting text definitions into high-dimensional semantic vector spaces.

The final **Comprehensive Match Score** is calculated through an adaptive weighted assembly:

$$\text{Final Score} = \alpha \cdot \text{SkillMatch}(C, J) + \beta \cdot \text{Similarity}(\mathbf{v}_C, \mathbf{v}_J)$$

*(Where default weights are $\alpha = 0.60$ and $\beta = 0.40$ to balance explicit keyword mastery with conceptual background alignment).*

---

## 🛠️ Technology Stack & Dependencies

| Component | Selected Technologies | Production Purpose |
| :--- | :--- | :--- |
| **Language Runtime** | **TypeScript (ESNext / Node 22+)** | Absolute type-safety, modular namespaces, and async-await multi-threading. |
| **Frontend Foundation** | **React 19** + **Vite 6** | Ultra-lean, lightning-fast rendering cycles. Microsecond HDF updates. |
| **Styling Architecture** | **Tailwind CSS v4** + **Inter & JetBrains Mono** | Modern Swiss typography pairings, high-contrast grid lines, and adaptive flex layouts. |
| **API Backend Engine** | **Express.js v4** | Highly concurrent REST controllers with raw multi-part body support up to 15MB. |
| **Artificial Intelligence**| **Google Gen AI SDK (`@google/genai`)** | Streamlined interaction with the modern Gemini models. |
| **AI Model Asset** | **Gemini 3.5 Flash** | Sub-second extraction latency, structured JSON output validation schemas. |
| **Local File Database** | **ACID-safe Sim JSON DB Engine** | Direct file-system caching, auto-initialization, and durable offline mock seed arrays. |

---

## ⚙️ Exact Prompt Engineering Schemas

To ensure deterministic, production-safe structured outputs, the system forces `responseMimeType: "application/json"` and configures strict declarative response schemas.

### Resume Extractor JSON Schema (`/api/analyze-resume`)
```json
{
  "type": "OBJECT",
  "properties": {
    "name": { "type": "STRING", "description": "Candidate's full name. Fallback: 'Unknown Candidate'" },
    "email": { "type": "STRING", "description": "Normalized personal email string" },
    "phone": { "type": "STRING", "description": "Verified telephone or cellular number" },
    "skills": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "Standardized list of modern, relevant hard technical or modular soft skills"
    },
    "predictedRole": { "type": "STRING", "description": "Primary domain designation (e.g., Software Engineer, Data Scientist, ML-Ops)" },
    "experienceSummary": { "type": "STRING", "description": "Concise summary of tenure length and core achievements" },
    "education": { "type": "STRING", "description": "Highest academic degree plus the issuing institution" }
  },
  "required": ["name", "email", "skills", "predictedRole", "experienceSummary", "education"]
}
```

### Match Calculator & Cognitive Analysis Schema (`/api/match`)
```json
{
  "type": "OBJECT",
  "properties": {
    "score": { "type": "INTEGER", "description": "0-100 score calculated by weighted similarity alignment" },
    "matchedSkills": { "type": "ARRAY", "items": { "type": "STRING" }, "description": "Direct matching proficiencies" },
    "missingSkills": { "type": "ARRAY", "items": { "type": "STRING" }, "description": "Requested skills not defined in resume" },
    "explanation": { "type": "STRING", "description": "3-4 sentence comprehensive match justification paragraph" },
    "gapAnalysis": { "type": "STRING", "description": "Constructive tips suggesting skills or certifications to acquire" },
    "interviewQuestions": {
      "type": "ARRAY",
      "items": { "type": "STRING" },
      "description": "Exactly three tailored, context-specific questions designed to test background claims"
    }
  },
  "required": ["score", "matchedSkills", "missingSkills", "explanation", "gapAnalysis", "interviewQuestions"]
}
```

---

## 🚀 Future-Proof Scaling Blueprint (PostgreSQL + pgvector)

For production deployments surpassing 10,000+ candidate matrices, scale the local persistent engine to structural Postgres databases using **Drizzle ORM** and **pgvector**.

### 1. Database Schema (`src/db/schema.ts`)
```typescript
import { pgTable, text, timestamp, integer, uuid, vector } from 'drizzle-orm/pg-core';

export const candidates = pgTable('candidates', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  phone: text('phone'),
  skills: text('skills').array().notNull(), // PostgreSQL text array
  predictedRole: text('predicted_role').notNull(),
  resumeText: text('resume_text').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // Vector space coordinates
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
Leverage **pgvector's Hierarchical Navigable Small World (HNSW)** indexing to execute search queries at $O(\log N)$ complexity:

```sql
-- Establish an HNSW index using Cosine Distance operator
CREATE INDEX candidate_hnsw_idx 
ON candidates 
USING hnsw (embedding vector_cosine_ops);

-- Query the 10 closest candidate matches for a target Job Embedding
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

## 🚦 Local Installation & Startup Guide

### 📋 Prerequisites
- **Node.js**: v18.0.0+
- **npm**: v9.0.0+
- **API Key**: A valid `GEMINI_API_KEY` configured in your system environment.

### ⚙️ Build and Run Commands
```bash
# 1. Clone & enter repository
git clone https://github.com/your-username/MatchMind-AI.git
cd MatchMind-AI

# 2. Install production and dev modules
npm install

# 3. Create active environment file
cp .env.example .env
# Edit .env file to attach your GEMINI_API_KEY

# 4. Start concurrent TSX and Express Webpack server in DEV mode
npm run dev

# 5. Build optimized bundle package for production release
npm run build

# 6. Execute highly compressed production build
npm run start
```

---

## 📁 Repository Map
```tree
MatchMind-AI/
├── data/
│   └── db.json               # Auto-initializing, ACID-emulating local DB File
├── src/
│   ├── types.ts              # Absolute type boundaries, schemas, and API formats
│   ├── App.tsx               # Main high-fidelity React workspace application
│   ├── index.css             # Entry Stylesheet featuring Inter font family imports
│   └── main.tsx              # React mounting root
├── server.ts                 # Full-stack backend Express controllers & API endpoints
├── tsconfig.json             # ESNext strict compilation flags
├── package.json              # Package dependencies and node build scripts
└── README.md                 # Technical product guide and model documentation
```

---

## ⚖️ License & Attribution

MatchMind AI is distributed under the enterprise-secure **Apache 2.0 License**.

*Built with passion, rigor, and technical craftsmanship.*
