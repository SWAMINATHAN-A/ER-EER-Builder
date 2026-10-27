# ER & EER Diagram Studio

> An interactive ER & EER Diagram Studio featuring drag-and-drop modeling, specialization hierarchies, and automated SQL DDL generation. Powered by Gemini AI, it includes an interactive practice arena for schema challenges, structured learning modules, and a quadratic probing hashing visualizer.

---
-**Hosted on:** https://er-builder-ca36b.web.app/

## ✨ Features

- **🎨 Interactive ER & EER Canvas**: Build Entity-Relationship and Enhanced Entity-Relationship diagrams with drag-and-drop entities, attributes (key, multivalued, composite, derived), and relationships with customizable cardinalities.
- **🧬 EER Specialization & Generalization**: Model disjoint and overlapping specialization hierarchies with total or partial participation constraints.
- **⚡ SQL DDL Code Generator**: Instantly generate clean, production-ready SQL DDL statements (CREATE TABLE, PRIMARY KEY, FOREIGN KEY constraints) directly from your diagram.
- **🎯 Practice Arena**: Solve hands-on database design challenges with real-time AI validation and feedback powered by Google Gemini.
- **📚 Conceptual Learning Center**: Guided interactive modules explaining database design fundamentals, normalization, ER-to-relational mapping rules, and cardinalities.
- **🔍 Quadratic Probing Hashing Visualizer**: Step-by-step visual exploration of open addressing hash table collision resolution using quadratic probing.
- **📤 Export & Sharing**: Export high-resolution PNG, JPEG, and PDF documents of your diagrams with a single click.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript / JSX, Vite
- **Styling**: Tailwind CSS
- **Diagramming & Layout**: React Flow, Dagre
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Icons & Motion**: Lucide React, Motion
- **Export Utilities**: jsPDF, html2canvas, html-to-image

---


**Configure Environment Variables:**
   Create a `.env` or `.env.local` file in the root directory (refer to `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

---

## 👥 Developers

- **Prithivraj** (Reg No: 25BCE1073) – Student Developer, B.Tech CSE
- **Sai Neeraj** (Reg No: 25BCE1066) – Student Developer, B.Tech CSE

---

## 📄 License

This project was developed as part of the Database Management Systems coursework.
