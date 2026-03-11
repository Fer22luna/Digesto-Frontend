import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BulletinDocument, Regulation } from '../types';
import { format } from 'date-fns';

export function generateRegulationPDF(regulation: Regulation): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Header with logo placeholder
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('[LOGO]', margin, yPosition);
  yPosition += 10;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  const typeLabel = regulation.type === 'DECREE' ? 'DECRETO' :
                    regulation.type === 'RESOLUTION' ? 'RESOLUCIÓN' :
                    regulation.type === 'ORDINANCE' ? 'ORDENANZA' :
                    regulation.type === 'TRIBUNAL_RESOLUTION' ? 'RESOLUCIÓN TRIBUNAL' :
                    regulation.type === 'BID' ? 'LICITACIÓN' : regulation.type;
  doc.text(typeLabel, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Special Number
  doc.setFontSize(14);
  doc.text(regulation.specialNumber, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Metadata table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const metadata = [
    ['Fecha de Publicación', format(regulation.publicationDate, 'dd/MM/yyyy')],
    ['Referencia', regulation.reference],
    ['Estado', regulation.state],
    ['Estado Legal', regulation.legalStatus ?? 'SIN_ESTADO'],
    ['Palabras Clave', regulation.keywords.join(', ')],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: metadata,
    theme: 'grid',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Content
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTENIDO', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Split content into lines
  const contentLines = doc.splitTextToSize(
    regulation.content.replace(/[#*]/g, ''),
    pageWidth - 2 * margin
  );

  contentLines.forEach((line: string) => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Digital Signature Section
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = margin;
  } else {
    yPosition += 20;
  }

  doc.setDrawColor(0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFont('helvetica', 'bold');
  doc.text('FIRMA DIGITAL', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('[Firma Digital del Director]', margin, yPosition);
  yPosition += 6;
  doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, yPosition);

  return doc;
}

export function downloadRegulationPDF(regulation: Regulation): void {
  const doc = generateRegulationPDF(regulation);
  doc.save(`${regulation.specialNumber}.pdf`);
}

export function generateBulletinPDF(bulletin: BulletinDocument): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;
  const issueDate =
    bulletin.issueDate && !Number.isNaN(bulletin.issueDate.getTime())
      ? bulletin.issueDate
      : new Date();

  // Logo placeholder and header (municipality/department removed)
  doc.setDrawColor(0);
  doc.rect(margin, yPosition, 18, 18);
  doc.setFontSize(7);
  doc.text('LOGO', margin + 9, yPosition + 10, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Publicación Boletín Oficial', pageWidth / 2, yPosition + 8, { align: 'center' });

  yPosition += 22;
  doc.setFontSize(10);
  doc.text(`Número: ${bulletin.documentNumber}`, margin, yPosition);
  doc.text(format(issueDate, 'dd/MM/yyyy'), pageWidth - margin, yPosition, { align: 'right' });

  yPosition += 8;
  doc.setFont('helvetica', 'bold');
  doc.text(`Referencia: ${bulletin.reference}`, margin, yPosition);

  yPosition += 12;
  doc.setFontSize(14);
  doc.text(bulletin.title, pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const paragraphs = [
    bulletin.subject,
    bulletin.openingDetails,
    bulletin.infoDetails,
    bulletin.extraNotes,
    `Estado actual: ${bulletin.state}`,
  ].filter(Boolean) as string[];

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
    yPosition += 4;
  });

  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = margin;
  }

  // Signature block
  doc.line(margin, yPosition + 8, pageWidth - margin, yPosition + 8);
  yPosition += 18;
  doc.setFont('helvetica', 'bold');
  doc.text(bulletin.signerName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(bulletin.signerRole, pageWidth / 2, yPosition, { align: 'center' });

  if (bulletin.footerNote) {
    yPosition += 10;
    doc.setFontSize(8);
    doc.text(bulletin.footerNote, pageWidth / 2, yPosition, { align: 'center' });
  }

  return doc;
}

export function downloadBulletinPDF(bulletin: BulletinDocument): void {
  const doc = generateBulletinPDF(bulletin);
  const sanitizedTitle = bulletin.title.replace(/\s+/g, '_');
  doc.save(`${bulletin.documentNumber || sanitizedTitle}.pdf`);
}
