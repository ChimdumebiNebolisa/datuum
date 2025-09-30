import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ExportOptions } from '@/types';

export async function exportChart(
  chartElement: HTMLElement,
  options: ExportOptions
): Promise<void> {
  const canvas = await html2canvas(chartElement, {
    backgroundColor: '#ffffff',
    scale: options.format === 'pdf' ? 2 : 1,
    useCORS: true,
  });

  if (options.format === 'png') {
    const link = document.createElement('a');
    link.download = `${options.filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else if (options.format === 'svg') {
    // For SVG, we'll convert the canvas to SVG
    const svgData = canvasToSVG(canvas);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${options.filename}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } else if (options.format === 'pdf') {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${options.filename}.pdf`);
  }
}

function canvasToSVG(canvas: HTMLCanvasElement): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', canvas.width.toString());
  svg.setAttribute('height', canvas.height.toString());

  const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  img.setAttribute('width', canvas.width.toString());
  img.setAttribute('height', canvas.height.toString());
  img.setAttribute('href', canvas.toDataURL('image/png'));

  svg.appendChild(img);
  return new XMLSerializer().serializeToString(svg);
}

export function generateFilename(chartType: string, timestamp?: Date): string {
  const now = timestamp || new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  return `chart-${chartType}-${dateStr}-${timeStr}`;
}
