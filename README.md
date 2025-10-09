# Data Visualization Tool 📊

A lightweight web application that lets users upload CSV files or input data manually to generate beautiful, interactive charts instantly — all in the browser with no backend required.

---

## 🧠 Overview

The Data Visualization Tool empowers users to transform raw CSV data into meaningful insights through instant chart generation, interactivity, and customization — all without server dependencies.  

--ACCOMPLISHED "real-time visualization" THROUGH "client-only rendering" USING "Next.js App Router and Chart.js" METHOD--

---

## YOUR PROJECT README

- Problem: non-technical users often struggle to visualize data without complex tools.  
- Solution: an intuitive, zero-setup web app for instant CSV-based visualization.  
- Users: students, analysts, small teams, and educators.  
- Outcome: faster insight generation and more accessible data storytelling.

---

## 🚀 Features

- CSV Upload and live preview  
- Manual data editing in interactive tables  
- Chart Types: Bar, Line, Pie, and Scatter  
- Fully interactive visuals powered by Chart.js  
- Export charts as PNG, SVG, or PDF  
- Customize colors, titles, and labels  
- Client-side only (no backend)

--ACCOMPLISHED "dynamic CSV parsing" THROUGH "stream-based file handling" USING "PapaParse" METHOD--  
--ACCOMPLISHED "instant export" THROUGH "canvas snapshotting" USING "html2canvas + jsPDF" METHOD--

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| Framework | Next.js 15 (App Router) |
| Visualization | Chart.js |
| Styling | Tailwind CSS |
| File Parsing | PapaParse |
| Export | html2canvas + jsPDF |
| Language | TypeScript |

---

## 📂 Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page component
├── components/          # React components
│   ├── ChartControls.tsx
│   ├── ChartRenderer.tsx
│   ├── DataTable.tsx
│   ├── ExportControls.tsx
│   └── FileUpload.tsx
├── lib/                 # Utility libraries
├── types/               # TypeScript types
│   └── index.ts
└── utils/               # Helper functions
    ├── chartUtils.ts
    ├── csvParser.ts
    └── exportUtils.ts
```

---

## 🔧 Setup & Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd data-viz-tool
```
2. Install dependencies:
```bash
npm install
```
3. Run the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000)

---

## RECRUITEMENT GATHERING

- Gather requirements from small teams and individual users about data visualization needs.  
- Define must-have features (chart types, CSV handling, export options).  
- Identify usability constraints (speed, browser memory limits).


---

## ANALYSIS AND DESIGN

- Break down components into data, view, and chart layers.  
- Map CSV structure to chart schema dynamically.  
- Define UX flow for upload → table → chart → export.  
- Optimize layout for both desktop and tablet devices.

---

## IMPLEMENTATION

- Built responsive UI with Next.js and Tailwind CSS.  
- Added CSV parsing pipeline via PapaParse.  
- Rendered charts dynamically using Chart.js.  
- Integrated export utilities for PNG/SVG/PDF downloads.

---

## TESTING

- Unit tests for utils (CSV parsing, export logic).  
- Manual QA for multi-browser consistency.  
- Performance profiling for large CSVs (5MB+).  
- Accessibility checks with keyboard navigation and ARIA labels.

---

## DEPLOYMENT

- Deployed frontend directly on Vercel for serverless hosting.  
- Automatic builds on push to main branch.  
- Continuous integration via GitHub Actions.  
- Environment variable configuration through `.env.local`.

---

## MAINTENANCE

- Track errors via browser console reports.  
- Schedule dependency upgrades quarterly.  
- Plan for user feedback via GitHub Issues.  
- Maintain code formatting and linting standards.

---

## 📈 Roadmap

- Add more chart types (Heatmap, Radar, Bubble)  
- Enable data persistence with IndexedDB  
- Add custom themes and templates  
- Real-time collaboration mode  
- API integrations for live data sources

---

## 🤝 Contributing

1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/awesome-update`)  
3. Commit changes (`git commit -m "Add new feature"`)  
4. Push to your branch  
5. Submit a Pull Request  

---

## 📝 License

This project is licensed under the **MIT License** — see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Inspired by lightweight open-source chart builders  
- Built with love for clarity, simplicity, and accessibility  
