# Syntaq.io — Cinematic Code Improvement Advisor

Syntaq.io is a high-fidelity, production-grade command center for automated code analysis and refactoring. It leverages a sophisticated **Multi-Agent Orchestration System** powered by **Google Gemini** to provide deep, architectural insights into your GitHub repositories.

![Syntaq.io UI](https://res.cloudinary.com/dt9vsv3yv/image/upload/v1/syntaq_preview.png)

## 🚀 How It Works

Syntaq.io operates as a distributed intelligence layer over your source code. The workflow is designed for precision and architectural depth:

1.  **Repository Ingestion**: The application fetches your GitHub repository structure in real-time via the GitHub REST API.
2.  **Selective Contextualization**: Users can explore the file tree and select specific files or directories to analyze, ensuring the AI focuses on critical components without unnecessary noise.
3.  **Multi-Agent Analysis Engine**: Once triggered, the code is dispatched to a cluster of specialized AI agents:
    *   **🛡️ Security Auditor**: Scans for OWASP vulnerabilities, injection risks, and sensitive credential leaks.
    *   **⚡ Performance Guru**: Evaluates runtime complexity, memory efficiency, and scalability bottlenecks.
    *   **🏗️ Software Architect**: Audits compliance with SOLID principles, design patterns, and maintainability standards.
4.  **Synthesis Layer**: A **Lead Principal Architect Agent** synthesizes the specialized findings into a unified, high-impact Executive Report, complete with quality scores and actionable gates.
5.  **Interactive Improvement**: Users can chat with the report to ask follow-up questions or use the "Fix" engine to generate verified refactoring suggestions.

## 💎 Key Features

*   **Cinematic "Indigo Hero" UI**: A premium, dark-mode interface with glassmorphism effects, smooth animations, and high-fidelity interactive elements.
*   **Quality Heatmaps**: Visual indicators within the file explorer that highlight potential "hotspots" or complex areas requiring attention.
*   **AI Documentation Generator**: Automatically generates comprehensive technical documentation and READMEs based on analyzed code architecture.
*   **Live AI Chat**: Context-aware chat system linked directly to the analysis results for real-time code consultation.
*   **PDF & MD Exports**: Export your professional code audit reports as high-quality PDFs or Markdown files for team distribution.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **AI Engine**: [Google Gemini Pro](https://deepmind.google/technologies/gemini/)
*   **Styling**: Vanilla CSS with a Custom Cinematic Design System
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Data Integration**: GitHub REST API (v3)

## 📦 Getting Started

### Prerequisites

*   Node.js 18.x or higher
*   A GitHub Personal Access Token (optional, for higher rate limits)
*   A Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adepuvinaysai/syntaq.io.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_key_here
   GITHUB_TOKEN=your_github_token_here (optional)
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

## 🔌 API Reference

Syntaq.io provides a robust internal API for code analysis and repository management.

### `POST /api/analyze`
Standard single-agent analysis.
- **Payload**: `{ url: string, files?: string[], mode: 'sentinel' | 'optimizer' | 'mentor' | 'standard' }`
- **Headers**: `X-GitHub-Token` (Optional)
- **Response**: Chunked text stream (Markdown) with a JSON data block and `X-Code-Context` header.

### `POST /api/analyze/multi-agent`
Orchestrated multi-agent analysis with synthesis.
- **Payload**: `{ url: string, files: string[], combinedCode: string }`
- **Response**: Chunked text stream (Markdown) synthesized by a Lead Architect Agent.

### `POST /api/repo/tree`
Fetches a filtered repository tree.
- **Payload**: `{ url: string }`
- **Response**: `{ tree: FileItem[], owner: string, repo: string, branch: string }`

### `POST /api/fix`
Generates verified fixes for specific code issues.
- **Payload**: `{ code: string, issue: string }`
- **Response**: `{ suggestion: string }`

### `POST /api/docs`
Generates comprehensive technical documentation.
- **Payload**: `{ code: string, repoName: string }`
- **Response**: `{ markdown: string }`

---

*Syntaq.io — Engineering the future of code quality.*
