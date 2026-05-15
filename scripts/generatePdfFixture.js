/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { jsPDF } = require('jspdf');

const doc = new jsPDF();
doc.setFontSize(16);
doc.text("Sample Lab Results", 14, 20);

doc.setFontSize(12);

// We manually draw a table to ensure it extracts as text properly
const headers = ["Date", "TSH", "T3", "T4", "TSH_Lower", "TSH_Upper", "Source"];
const rows = [
  ["2024-01-15", "2.1", "1.4", "8.2", "0.5", "4.5", "Lab A"],
  ["2024-04-10", "3.8", "1.2", "7.5", "0.5", "4.5", "Lab A"],
  ["2024-07-20", "4.2", "1.1", "7.1", "0.5", "4.5", "Lab B"],
];

let y = 40;
const startX = 14;
const colWidths = [30, 20, 20, 20, 30, 30, 30];

// Draw headers
for (let i = 0; i < headers.length; i++) {
  const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
  doc.text(headers[i], x, y);
}

y += 10;

// Draw rows
for (const row of rows) {
  for (let i = 0; i < row.length; i++) {
    const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.text(row[i], x, y);
  }
  y += 10;
}

const pdfBuffer = doc.output('arraybuffer');
fs.writeFileSync('./public/sample-lab-data.pdf', Buffer.from(pdfBuffer));
console.log('Successfully generated public/sample-lab-data.pdf');
