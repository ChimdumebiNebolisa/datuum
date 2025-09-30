# Data Visualization Tool

A lightweight web application that lets users upload CSV files or input data manually to generate beautiful, interactive charts instantly - all in the browser with no backend required.

## Features

- **CSV Upload**: Drag and drop or click to upload CSV files
- **Manual Data Entry**: Edit data directly in an interactive table
- **Multiple Chart Types**: Bar, Line, Pie, and Scatter plots
- **Interactive Charts**: Powered by Chart.js for smooth interactions
- **Export Options**: Download charts as PNG, SVG, or PDF
- **Customization**: Change colors, titles, and axis labels
- **No Backend**: Everything runs client-side in your browser

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Visualization**: Chart.js
- **Styling**: Tailwind CSS
- **File Parsing**: PapaParse
- **Export**: html2canvas + jsPDF
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

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

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Usage

### Uploading Data

1. **CSV Upload**: Drag and drop a CSV file onto the upload area or click to select
2. **Manual Entry**: After uploading, you can edit data directly in the table
3. **Data Validation**: The app automatically detects column types (numeric, categorical, date)

### Creating Charts

1. Switch to the "Chart" tab after uploading data
2. Choose your chart type (Bar, Line, Pie, Scatter)
3. Select X and Y axis columns
4. Customize colors, title, and other settings
5. Export your chart in multiple formats

### Supported File Formats

- CSV files up to 5MB
- UTF-8 encoding
- Headers in the first row
- Automatic type detection for columns

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page component
├── components/         # React components
│   ├── ChartControls.tsx
│   ├── ChartRenderer.tsx
│   ├── DataTable.tsx
│   ├── ExportControls.tsx
│   └── FileUpload.tsx
├── lib/               # Library code
├── types/             # TypeScript type definitions
│   └── index.ts
└── utils/             # Utility functions
    ├── chartUtils.ts
    ├── csvParser.ts
    └── exportUtils.ts
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any static hosting service:

```bash
npm run build
# Deploy the 'out' directory
```

## Known Limitations

- Maximum file size: 5MB
- No persistent data storage (session-based only)
- No user authentication
- Limited to basic chart types
- Performance may degrade with very large datasets (>10k rows)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

Future features to consider:
- More chart types (heatmaps, radar charts)
- Data persistence with IndexedDB
- Template themes
- Advanced data filtering
- Real-time collaboration
- API integration for data sources

## Support

For issues and questions:
- Check the GitHub Issues page
- Review the documentation
- Create a new issue with detailed information