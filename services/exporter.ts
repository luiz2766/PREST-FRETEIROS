
import { ReportHeader, RomaneioItem } from '../types';

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

export const generateExcel = async (header: ReportHeader, items: RomaneioItem[], totalDiarista: number, totalVale: number, totalFrete: number, totalGeral: number) => {
  const XLSX = await import('xlsx');

  const aoaData: any[][] = [
    ['PRESTAÇÃO DE CONTAS DE FRETEIROS'],
    [''],
    ['IDENTIFICAÇÃO DO PRESTADOR'],
    ['Prestador:', header.prestador],
    ['Perfil do Veículo:', header.perfilVeiculo],
    ['Placa:', header.placa],
    ['Data de Prestação:', header.dataPrestacao],
    [''],
    ['Data', 'Romaneio', 'Região', 'Produtos', 'CX', 'UN', 'Vale', 'KM Saída', 'KM Chegada', 'Outros', 'Valor Frete', 'Total Líquido']
  ];

  items.forEach(i => {
    aoaData.push([
      i.data,
      i.romaneio,
      i.regiao,
      i.produtos || '',
      i.quantidadeCx || 0,
      i.quantidadeUn || 0,
      i.vale || 0,
      i.kmSaida || 0,
      i.kmChegada || 0,
      i.diarista || 0,
      i.valorFrete,
      i.valorTotal
    ]);
  });

  aoaData.push(['']);
  aoaData.push(['', '', '', '', '', '', '', '', '', '', 'OUTROS (AJUDANTES):', totalDiarista]);
  aoaData.push(['', '', '', '', '', '', '', '', '', '', 'TOTAL VALES:', totalVale]);
  aoaData.push(['', '', '', '', '', '', '', '', '', '', 'TOTAL FRETE:', totalFrete]);
  aoaData.push(['', '', '', '', '', '', '', '', '', '', 'TOTAL LÍQUIDO:', totalGeral]);

  const ws = XLSX.utils.aoa_to_sheet(aoaData);
  const colWidths = [{ wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 15 }];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Prestação de Contas");
  XLSX.writeFile(wb, `prestacao_${header.prestador || 'frete'}.xlsx`);
};

export const generatePdf = async (header: ReportHeader, items: RomaneioItem[], totalDiarista: number, totalVale: number, totalFrete: number, totalGeral: number) => {
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('l', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESTAÇÃO DE CONTAS DE FRETEIROS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text('IDENTIFICAÇÃO DO PRESTADOR', 14, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Prestador de Serviço: ${header.prestador}`, 14, 32);
  doc.text(`Perfil do Veículo: ${header.perfilVeiculo}`, 14, 38);
  doc.text(`Placa: ${header.placa}`, pageWidth / 2, 32);
  doc.text(`Data de Prestação: ${header.dataPrestacao}`, pageWidth / 2, 38);
  
  autoTable(doc, {
    startY: 45,
    head: [['Data', 'Romaneio', 'Região', 'Produtos', 'CX', 'UN', 'Vale', 'Outros', 'V. Frete', 'Total Líq']],
    body: items.map(i => [
      i.data, 
      i.romaneio, 
      i.regiao, 
      i.produtos || '-',
      i.quantidadeCx || 0,
      i.quantidadeUn || 0,
      formatCurrency(i.vale),
      formatCurrency(i.diarista), 
      formatCurrency(i.valorFrete), 
      formatCurrency(i.valorTotal)
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`OUTROS: ${formatCurrency(totalDiarista)}`, pageWidth - 14, finalY, { align: 'right' });
  doc.text(`TOTAL VALES: ${formatCurrency(totalVale)}`, pageWidth - 14, finalY + 5, { align: 'right' });
  doc.text(`TOTAL FRETE: ${formatCurrency(totalFrete)}`, pageWidth - 14, finalY + 10, { align: 'right' });
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text(`TOTAL LÍQUIDO A PAGAR: ${formatCurrency(totalGeral)}`, pageWidth - 14, finalY + 17, { align: 'right' });

  doc.save(`prestacao_${header.prestador || 'frete'}.pdf`);
};
