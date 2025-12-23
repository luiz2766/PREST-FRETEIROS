
import React, { useState, useEffect } from 'react';
import HeaderForm from './components/HeaderForm';
import DataTable from './components/DataTable';
import SummaryFooter from './components/SummaryFooter';
import { PerfilVeiculo, ReportHeader, RomaneioItem, Regiao } from './types';
import { FRETE_TABLE } from './constants';
import { parsePdfData } from './services/pdfParser';
import { generateExcel, generatePdf } from './services/exporter';
import { FileUp, FileSpreadsheet, FileText, Plus, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<RomaneioItem[]>([]);
  
  // Estado inicial estático/determinístico para evitar Hydration Mismatch
  const [header, setHeader] = useState<ReportHeader>({
    prestador: '',
    perfilVeiculo: PerfilVeiculo.VUC,
    placa: '',
    dataPrestacao: '' 
  });

  // PROTEÇÃO DE HIDRATAÇÃO: Só executa após montar no browser
  useEffect(() => {
    setIsMounted(true);
    // Dados dinâmicos de runtime injetados apenas no cliente
    setHeader(prev => ({
      ...prev,
      dataPrestacao: new Date().toLocaleDateString('pt-BR')
    }));
  }, []);

  const calculateItemValues = (item: Partial<RomaneioItem>, perfil: PerfilVeiculo): RomaneioItem => {
    const kmSaida = item.kmSaida ?? null;
    const kmChegada = item.kmChegada ?? null;
    const kmRodado = (kmSaida !== null && kmChegada !== null) ? (kmChegada - kmSaida) : 0;
    const valorFrete = FRETE_TABLE[item.regiao || Regiao.NOT_FOUND][perfil];
    const valorTotal = valorFrete + (item.retornoZero || 0) + (item.diarista || 0);

    return {
      ...item,
      kmSaida,
      kmChegada,
      kmRodado,
      valorFrete,
      valorTotal
    } as RomaneioItem;
  };

  // Recálculo automático quando o perfil do veículo muda
  useEffect(() => {
    if (isMounted && items.length > 0) {
      setItems(prevItems => prevItems.map(item => calculateItemValues(item, header.perfilVeiculo)));
    }
  }, [header.perfilVeiculo, isMounted]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Import dinâmico ou serviço isolado - chamado apenas via interação
      const { items: extractedItems, plaque } = await parsePdfData(file);
      const newItems = extractedItems.map(item => calculateItemValues(item, header.perfilVeiculo));
      
      setHeader(prev => ({ ...prev, placa: plaque }));
      setItems(newItems);
    } catch (error) {
      console.error('Erro no processamento do PDF:', error);
      alert('Falha ao ler o PDF. Verifique se o arquivo está correto.');
    } finally {
      setIsProcessing(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<RomaneioItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return calculateItemValues({ ...item, ...updates }, header.perfilVeiculo);
      }
      return item;
    }));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleAddItem = () => {
    const newItem: Partial<RomaneioItem> = {
      id: Math.random().toString(36).substr(2, 9),
      data: new Date().toLocaleDateString('pt-BR'),
      romaneio: '',
      regiao: Regiao.NOT_FOUND,
      kmSaida: null,
      kmChegada: null,
      retornoZero: 0,
      diarista: 0
    };
    setItems(prev => [...prev, calculateItemValues(newItem, header.perfilVeiculo)]);
  };

  const totalFrete = items.reduce((sum, i) => sum + i.valorFrete, 0);
  const totalDiarista = items.reduce((sum, i) => sum + i.diarista, 0);
  const totalGeral = items.reduce((sum, i) => sum + i.valorTotal, 0);

  // Fallback de renderização para evitar SSR incompleto
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Iniciando aplicação segura...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="p-2 bg-blue-600 text-white rounded-lg shadow-blue-200 shadow-lg"><FileText /></span>
            Prestação de Contas
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer transition-all shadow-md active:scale-95">
            {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp size={20} />}
            {isProcessing ? 'Processando...' : 'Importar Romaneio PDF'}
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
          </label>
          <button 
            onClick={() => generateExcel(header, items, totalDiarista, totalFrete, totalGeral)} 
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
          >
            <FileSpreadsheet size={20} /> Excel
          </button>
          <button 
            onClick={() => generatePdf(header, items, totalDiarista, totalFrete, totalGeral)} 
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all active:scale-95"
          >
            <FileText size={20} /> PDF
          </button>
        </div>
      </header>

      <HeaderForm header={header} onChange={setHeader} />

      <div className="flex justify-between items-center mb-4 mt-8">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          Itens de Frete 
          <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full">{items.length}</span>
        </h3>
        <button 
          onClick={handleAddItem} 
          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 font-bold text-sm transition-all px-4 py-2 rounded-xl"
        >
          <Plus size={18} /> Adicionar Linha
        </button>
      </div>

      <DataTable items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />

      <SummaryFooter diarista={totalDiarista} totalFrete={totalFrete} totalGeral={totalGeral} />
      
      <footer className="mt-12 text-center text-gray-400 text-sm border-t pt-8">
        Sistema de Prestação de Contas v2.0 - Processamento 100% Client-Side
      </footer>
    </div>
  );
};

export default App;
