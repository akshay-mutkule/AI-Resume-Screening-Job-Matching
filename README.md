```markdown
# 🚀 MatchMind AI
### AI-Powered Resume Screening & Job Matching System

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react"/>
  <img src="https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript"/>
  <img src="https://img.shields.io/badge/Express.js-Backend-green?style=for-the-badge&logo=express"/>
  <img src="https://img.shields.io/badge/Gemini-AI-orange?style=for-the-badge&logo=google"/>
  <img src="https://img.shields.io/badge/SQLite-JSON-lightgrey?style=for-the-badge&logo=sqlite"/>
</p>

<p align="center">
An intelligent AI-powered recruitment platform that automatically analyzes resumes, matches candidates with job descriptions using custom similarity algorithms, identifies skill gaps, and generates personalized interview questions using Google's Gemini AI.
</p>

---

# 📌 Overview

**MatchMind AI** is a modern AI recruitment platform built to simplify and automate the hiring process.

Instead of manually reviewing hundreds of resumes, recruiters can upload resumes and a job description, allowing MatchMind AI to instantly:

- 📄 Parse resumes into structured data
- 🎯 Match candidates with job requirements
- 📊 Calculate similarity scores
- 🧠 Detect missing skills
- ❓ Generate AI-powered interview questions
- 📈 Rank applicants based on overall compatibility

The platform combines traditional Natural Language Processing techniques with Google's **Gemini 3.5 Flash** model to deliver accurate and explainable hiring recommendations.

---

# ✨ Key Features

## 📄 Intelligent Resume Parsing

- Upload resumes (PDF/DOCX)
- AI extracts:
  - Personal Information
  - Education
  - Experience
  - Skills
  - Projects
  - Certifications
  - Languages

Resume data is converted into structured JSON schemas for efficient processing.

---

## 🎯 AI Job Matching

The system compares candidate profiles against job descriptions using a **Custom Cosine Similarity Algorithm**.

It evaluates:

- Technical Skills
- Experience
- Education
- Keywords
- Domain Knowledge

Each candidate receives a compatibility percentage.

Example:

```

Overall Match Score

92%
Excellent Match

```

---

## 📊 Skill Gap Analysis

The application identifies:

✅ Matching Skills

❌ Missing Skills

⚠ Recommended Skills

Recruiters instantly understand where candidates excel and where improvement is needed.

Example:

```

Required:
Python
React
Docker
AWS

Candidate:
Python
React
Node.js

Missing:
Docker
AWS

```

---

## 🤖 AI Interview Question Generator

Using **Gemini 3.5 Flash**, MatchMind AI automatically generates customized interview questions based on:

- Resume
- Job Description
- Missing Skills
- Candidate Experience

Example:

```

Explain Docker containerization.

How would you deploy a React application on AWS?

Describe a challenging backend project you've completed.

```

---

## 📈 Candidate Ranking

Applicants are automatically ranked using multiple weighted parameters.

Evaluation includes:

- Resume Quality
- Skill Match
- Experience
- Education
- AI Similarity Score

This enables recruiters to shortlist the best candidates in seconds.

---

## 📊 Analytics Dashboard

Professional recruiter dashboard featuring:

- Candidate Cards
- Match Percentages
- Shortlist Indicators
- Skill Charts
- Resume Statistics
- Interview Readiness Metrics

---

# 🎨 UI & Design

MatchMind AI follows a modern **Professional Polish Theme** with emphasis on clarity and usability.

### Design Highlights

- Elegant Dual-Tone Color Palette
- High-Contrast Grid Layout
- Fully Responsive Design
- Accessible UI Components
- Interactive Candidate Cards
- Clean Typography
- Professional Dashboard
- Custom Progress Indicators
- Animated Match Score Visualizations
- Shortlist Status Badges
- Cosine Similarity Charts

The interface is optimized for recruiters on desktop, tablet, and mobile devices.

---

# 🏗 System Architecture

```

```
                +--------------------+
                |    React 19 UI     |
                +---------+----------+
                          |
                          |
                REST API Requests
                          |
                          ▼
            +--------------------------+
            | Express.js + TypeScript |
            +-----------+-------------+
                        |
        +---------------+----------------+
        |                                |
        ▼                                ▼
 SQLite JSON Storage           Gemini 3.5 Flash
   Candidate Data              NLP Processing
        |                                |
        +---------------+----------------+
                        |
                 AI Recommendations
                        |
                        ▼
              Candidate Match Results
```

```

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- CSS3
- Responsive UI

---

## Backend

- Express.js
- TypeScript
- Node.js

---

## AI & NLP

- Google Gemini 3.5 Flash
- @google/genai
- Custom Cosine Similarity Algorithm
- Resume Parsing Engine
- NLP Processing

---

## Database

- SQLite
- JSON Storage

---

# ⚙ Project Workflow

```

Upload Resume
│
▼
Resume Parsing
│
▼
Structured JSON
│
▼
Job Description Analysis
│
▼
Cosine Similarity Matching
│
▼
Skill Gap Detection
│
▼
Gemini AI Processing
│
▼
Interview Question Generation
│
▼
Candidate Ranking
│
▼
Recruiter Dashboard

```

---

# 📁 Project Structure

```

MatchMind-AI/

│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── assets/
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│   └── database/
│
├── shared/
│
├── uploads/
│
├── package.json
│
└── README.md

````

---

# 🔌 REST API Endpoints

## Candidate Management

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/candidates` | Fetch all candidates |
| GET | `/api/candidates/:id` | Get candidate details |
| POST | `/api/candidates` | Upload candidate resume |
| DELETE | `/api/candidates/:id` | Remove candidate |

---

## AI Matching

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/match` | Match resume against job description |
| POST | `/api/parse` | Parse uploaded resume |
| POST | `/api/interview` | Generate interview questions |
| POST | `/api/gap-analysis` | Generate skill gap analysis |

---

## Dashboard

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/analytics` | Recruitment analytics |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/MatchMind-AI.git

cd MatchMind-AI
````

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file.

```env
PORT=5000

GEMINI_API_KEY=YOUR_GEMINI_API_KEY

NODE_ENV=development
```

---

## Run Development Server

```bash
npm run dev
```

---

## Production Build

```bash
npm run build

npm start
```

---

# 📊 AI Pipeline

```
Resume Upload
      │
      ▼
Resume Parsing
      │
      ▼
JSON Schema Conversion
      │
      ▼
Feature Extraction
      │
      ▼
Cosine Similarity Prediction
      │
      ▼
Gap Analysis
      │
      ▼
Gemini AI
      │
      ▼
Interview Question Generation
      │
      ▼
Final Candidate Report
```

---

# 🎯 Use Cases

* HR Recruitment
* Resume Screening
* Campus Hiring
* Talent Acquisition
* Recruitment Automation
* Applicant Tracking
* Career Assessment
* Skill Evaluation

---

# 🔒 Security

* Input Validation
* Secure REST APIs
* Environment Variable Protection
* Error Handling
* File Upload Validation
* Type-Safe Backend
* Clean JSON Storage

---

# 🚀 Future Enhancements

* JWT Authentication
* Recruiter Dashboard Login
* Resume PDF Reports
* Candidate Email Notifications
* AI Resume Suggestions
* Multi-language Resume Parsing
* ATS Score Prediction
* PostgreSQL Support
* Docker Deployment
* Cloud Hosting

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to your branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Akshay Mutkule**

Computer Engineering Student

AI & Machine Learning Enthusiast

Passionate about building intelligent software solutions using Artificial Intelligence, Natural Language Processing, and Full-Stack Development.

---

# ⭐ Support

If you found this project useful:

⭐ Star this repository

🍴 Fork the project

📢 Share it with others

---
