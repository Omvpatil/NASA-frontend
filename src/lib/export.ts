// src/lib/export.ts
import { type Node } from 'reactflow';
import { type Publication } from './publication-type';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

function getFilename(format: 'pdf' | 'csv', type: string, id: string): string {
    const date = new Date();
    const yyyymmdd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const safeId = id.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 50);
    return `export_${type}_${safeId}_${yyyymmdd}.${format}`;
}


function exportToCSV(node: Node, publications: Publication[]) {
  const { type, label } = node.data;
  const nodeId = node.id;
  const headers = ['id', 'title', 'year', 'authors', 'summary', 'link'];

  const rows = publications.map(pub => [
    pub.id,
    `"${pub.title.replace(/"/g, '""')}"`,
    pub.publicationYear,
    `"${pub.authors.join('; ')}"`,
    `"${pub.summary.replace(/"/g, '""')}"`,
    pub.link,
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', getFilename('csv', type, label || nodeId));
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function exportToPDF(node: Node, publications: Publication[]) {
    const { type, label } = node.data;
    const nodeId = node.id;
    const doc = new jsPDF() as jsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text(`BioSpace Explorer Export`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Focused on: ${label} (Type: ${type})`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 38);

    if (type === 'publication' && publications.length === 1) {
        const pub = publications[0];
        doc.setFontSize(14);
        doc.text(pub.title, 14, 50, { maxWidth: 180 });
        doc.setFontSize(10);
        doc.text(`Authors: ${pub.authors.join(', ')}`, 14, 65);
        doc.text(`Year: ${pub.publicationYear}`, 14, 71);
        doc.text(`Link: ${pub.link}`, 14, 77);
        
        doc.setFontSize(12);
        doc.text('Summary:', 14, 87);
        doc.setFontSize(10);
        const splitSummary = doc.splitTextToSize(pub.summary, 180);
        doc.text(splitSummary, 14, 93);

    } else {
         doc.autoTable({
            startY: 50,
            head: [['Title', 'Year', 'Authors']],
            body: publications.map(p => [p.title, p.publicationYear, p.authors.join(', ')]),
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [0,0,0]
            }
        });
    }

    doc.save(getFilename('pdf', type, label || nodeId));
}


export function handleExport(format: 'pdf' | 'csv', node: Node, publications: Publication[]) {
  if (format === 'pdf') {
    exportToPDF(node, publications);
  } else if (format === 'csv') {
    exportToCSV(node, publications);
  }
}

export function handlePresentationExport(
  trendsData: { publicationsByYear: { year: number, count: number }[], topTopics: { name: string, count: number }[] },
  gapsData: { topic: string, organism: string | null, environment: string | null, count: number }[],
  representativePubs: Publication[]
) {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

  // Title Page
  doc.setFontSize(22);
  doc.text('BioSpace Explorer: Insights Report', 105, 100, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Generated on: ${date.toLocaleDateString()}`, 105, 110, { align: 'center' });

  // Trends Section
  doc.addPage();
  doc.setFontSize(18);
  doc.text('Research Trends', 14, 22);

  if (trendsData?.publicationsByYear.length > 0) {
    doc.setFontSize(14);
    doc.text('Publications Over Time', 14, 35);
    doc.autoTable({
        startY: 40,
        head: [['Year', 'Publication Count']],
        body: trendsData.publicationsByYear.map(d => [d.year, d.count]),
        headStyles: { fillColor: [0,0,0] },
    });
  }
  
  if (trendsData?.topTopics.length > 0) {
    const trendsTableHeight = (trendsData.publicationsByYear.length + 1) * 10 + 40;
    doc.text('Top 10 Research Topics', 14, trendsTableHeight + 10);
    doc.autoTable({
        startY: trendsTableHeight + 15,
        head: [['Topic', 'Publication Count']],
        body: trendsData.topTopics.map(t => [t.name, t.count]),
        headStyles: { fillColor: [0,0,0] },
    });
  }


  // Gaps Section
  if (gapsData?.length > 0) {
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Identified Research Gaps', 14, 22);
    doc.setFontSize(10);
    doc.text('Potentially under-studied areas based on combinations of topics, organisms, and environments.', 14, 30);
    doc.autoTable({
        startY: 40,
        head: [['Topic', 'Organism', 'Environment', 'Count']],
        body: gapsData.slice(0, 15).map(g => [g.topic, g.organism || '-', g.environment || '-', g.count]),
        headStyles: { fillColor: [0,0,0] },
    });
  }


  // Representative Publications Section
  if(representativePubs?.length > 0){
    doc.addPage();
    doc.setFontSize(18);
    doc.text('Representative Publications', 14, 22);
    let currentY = 35;
    representativePubs.forEach(pub => {
        if (currentY > 250) {
        doc.addPage();
        currentY = 22;
        }
        doc.setFontSize(12);
        doc.text(pub.title, 14, currentY, { maxWidth: 180 });
        currentY += 10;
        doc.setFontSize(10);
        const summaryLines = doc.splitTextToSize(`Summary: ${pub.summary}`, 180);
        doc.text(summaryLines, 14, currentY);
        currentY += (summaryLines.length * 5) + 5;
    });
  }


  doc.save(`BioSpace_Insights_Report_${yyyymmdd}.pdf`);
}
