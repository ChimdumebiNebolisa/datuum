import path from 'path';
import fs from 'fs';

export default async function globalSetup() {
  const fixtureDir = path.join(process.cwd(), 'tests', 'fixtures');
  fs.mkdirSync(fixtureDir, { recursive: true });

  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  // Sheet 1: Lab Results — mirrors the CSV fixture column naming
  const labRows = [
    ['Date', 'TSH', 'T3', 'T4', 'TSH_Lower', 'TSH_Upper', 'T3_Lower', 'T3_Upper', 'Source'],
    ['2024-01-15', 2.5, 3.2, 8.1, 0.4, 4.0, 0.8, 2.0, 'Lab A'],
    ['2024-02-15', 3.1, 3.0, 7.8, 0.4, 4.0, 0.8, 2.0, 'Lab A'],
    ['2024-03-15', 1.8, 3.5, 8.5, 0.4, 4.0, 0.8, 2.0, 'Lab B'],
    ['2024-04-15', 4.2, 2.9, 7.2, 0.4, 4.0, 0.8, 2.0, 'Lab A'],
    ['2024-05-15', 2.1, 3.3, 8.0, 0.4, 4.0, 0.8, 2.0, 'Lab B'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(labRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Lab Results');

  // Sheet 2: Notes — gives a second sheet so the sheet selector modal appears
  const notesRows = [
    ['Date', 'Notes'],
    ['2024-01-15', 'Initial visit'],
    ['2024-02-15', 'Follow-up'],
    ['2024-03-15', 'Low TSH noted'],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(notesRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Notes');

  const fixturePath = path.join(fixtureDir, 'sample-lab-data.xlsx');
  XLSX.writeFile(wb, fixturePath);
  console.log(`\n[global-setup] XLSX fixture → ${fixturePath}`);
}
