
import * as pdfjs from 'pdfjs-dist';
import { CIADE_REGIAO_MAP } from '../constants';
import { Regiao, RomaneioItem } from '../types';

let isPdfInitialized = false;

const initPdfWorker = () => {
  if (typeof window !== 'undefined' && !isPdfInitialized) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.449/build/pdf.worker.min.mjs`;
    isPdfInitialized = true;
  }
};

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
  if (typeof window === 'undefined') {
    throw new Error("PDF parsing is only supported in the browser.");
  }

  // Inicializa o worker apenas no momento do uso
  initPdfWorker();

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join('  ');
    fullText += pageText + '  [PAGE_BREAK]  ';
  }

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

  const plaqueMatch = /Veiculo\s+([A-Z0-9-]{7,8})/i.exec(fullText);
  const plaque = plaqueMatch ? plaqueMatch[1].toUpperCase() : '';

  const items: Partial<RomaneioItem>[] = blocks.map(block => {
    const rotaRegex = /Rota\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s']+?)(?:\s{3,}|Dt\.Saida|KM|Hr\.|$)/i;
    const rotaMatch = rotaRegex.exec(block.text);
    
    let regiao = Regiao.NOT_FOUND;
    if (rotaMatch) {
      const city = normalizeText(rotaMatch[1]);
      regiao = CIADE_REGIAO_MAP[city] || Regiao.NOT_FOUND;
    }

    const kmInicialMatch = /KM\s+Inicial\s+(\d+)/i.exec(block.text);
    const kmFinalMatch = /KM\s+Final\s+(\d+)/i.exec(block.text);
    
    const kmSaida = kmInicialMatch ? parseInt(kmInicialMatch[1], 10) : null;
    const kmChegada = kmFinalMatch ? parseInt(kmFinalMatch[1], 10) : null;

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
