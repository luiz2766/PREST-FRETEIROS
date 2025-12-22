
import * as pdfjs from 'pdfjs-dist';
import { CIADE_REGIAO_MAP } from '../constants';
import { Regiao, RomaneioItem } from '../types';

pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs`;

/**
 * Normalizes text for comparison: removes accents, converts to uppercase, 
 * removes extra spaces.
 */
const normalizeText = (text: string) => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
};

export const parsePdfData = async (file: File): Promise<{ items: Partial<RomaneioItem>[], plaque: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Joining with multiple spaces helps preserve visual structure for regex
    const pageText = textContent.items.map((item: any) => item.str).join('  ');
    fullText += pageText + '  [PAGE_BREAK]  ';
  }

  // 1. Split text into blocks by Romaneio header
  // Pattern: Romaneio AAAA/MM/DD-NNN
  const romaneioHeaderRegex = /Romaneio\s+(\d{4}\/\d{2}\/\d{2})-(\d+)/g;
  const blocks: { text: string, data: string, romaneio: string }[] = [];
  let match;
  const indices: number[] = [];
  
  while ((match = romaneioHeaderRegex.exec(fullText)) !== null) {
    indices.push(match.index);
  }

  for (let i = 0; i < indices.length; i++) {
    const start = indices[i];
    const end = indices[i + 1] || fullText.length;
    const blockText = fullText.substring(start, end);
    
    const infoMatch = /Romaneio\s+(\d{4}\/\d{2}\/\d{2})-(\d+)/.exec(blockText);
    if (infoMatch) {
      const [y, m, d] = infoMatch[1].split('/');
      blocks.push({
        text: blockText,
        data: `${d}/${m}/${y}`,
        romaneio: infoMatch[2]
      });
    }
  }

  // 2. Extract Global Placa
  const plaqueMatch = /Veiculo\s+([A-Z0-9-]{7,8})/i.exec(fullText);
  const plaque = plaqueMatch ? plaqueMatch[1].toUpperCase() : '';

  // 3. Process each block with high precision
  const items: Partial<RomaneioItem>[] = blocks.map(block => {
    // 3.1 Identify City (Rota)
    // Rule: Capture text after "Rota" until next major field or space
    const rotaRegex = /Rota\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s']+?)(?:\s{3,}|Dt\.Saida|KM|Hr\.|$)/i;
    const rotaMatch = rotaRegex.exec(block.text);
    
    let regiao = Regiao.NOT_FOUND;
    if (rotaMatch) {
      const city = normalizeText(rotaMatch[1]);
      regiao = CIADE_REGIAO_MAP[city] || Regiao.NOT_FOUND;
    }

    // 3.2 KM Identification (Strictly from lines containing labels)
    const kmInicialMatch = /KM\s+Inicial\s+(\d+)/i.exec(block.text);
    const kmFinalMatch = /KM\s+Final\s+(\d+)/i.exec(block.text);
    
    const kmSaida = kmInicialMatch ? parseInt(kmInicialMatch[1], 10) : null;
    const kmChegada = kmFinalMatch ? parseInt(kmFinalMatch[1], 10) : null;

    // 3.3 Diarista Identification (Rule: Position 2 + code 003)
    // Looking for "2." followed by "003" with optional space
    const hasDiaristaCode = /2\.\s?003/.test(block.text);

    return {
      id: Math.random().toString(36).substr(2, 9),
      data: block.data,
      romaneio: block.romaneio,
      regiao,
      kmSaida,
      kmChegada,
      diarista: hasDiaristaCode ? 80.0 : 0.0,
      retornoZero: 0
    };
  });

  return { items, plaque };
};
