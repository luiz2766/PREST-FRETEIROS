
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
  const [header, setHeader] = useState<ReportHeader>({
    prestador: '',
    perfilVeiculo: PerfilVeiculo.VUC,
    placa: '',
    dataPrestacao: '' // Inicializado vazio para evitar Hydration Mismatch
  });

  const [items, setItems] = useState<RomaneioItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Hydration Guard e inicialização de data segura (apenas no cliente)
  useEffect(() => {
    setIsMounted(true);
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

  useEffect(() => {
    if (isMounted && items.length > 0) {
      setItems(prevItems => prevItems.map(item => calculateItemValues(item, header.perfilVeiculo)));
    }
  }, [header.perfilVeiculo, isMounted]);

  // Se não estiver montado, renderiza apenas um container vazio ou loader simples
  // Isso evita que o SSR tente renderizar componentes complexos antes do tempo
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const { items: extractedItems, plaque } = await parsePdfData(file);
      const newItems = extractedItems.map(item => calculateItemValues(item, header.perfilVeiculo));
      setHeader(prev => ({ ...prev, placa: plaque }));
      setItems(newItems);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      alert('Erro ao processar PDF. Verifique o formato do arquivo.');
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

  const handleExportExcel = () => generateExcel(header, items, totalDiarista, totalFrete, totalGeral);
  const handleExportPdf = () => generatePdf(header, items, totalDiarista, totalFrete, totalGeral);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <span className="p-2 bg-blue-600 text-white rounded-lg"><FileText /></span>
            Prestação de Contas
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all shadow-sm">
            {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp size={20} />}
            {isProcessing ? 'Processando...' : 'Importar PDF'}
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
          </label>
          <button 
            onClick={handleExportExcel} 
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
          >
            <FileSpreadsheet size={20} /> Excel
          </button>
          <button 
            onClick={handleExportPdf} 
            disabled={items.length === 0}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all"
          >
            <FileText size={20} /> PDF
          </button>
        </div>
      </header>

      <HeaderForm header={header} onChange={setHeader} />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">Itens do Lançamento</h3>
        <button onClick={handleAddItem} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors px-3 py-1 rounded-md hover:bg-blue-50"><Plus size={16} /> Adicionar</button>
      </div>

      <DataTable items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />

      <SummaryFooter diarista={totalDiarista} totalFrete={totalFrete} totalGeral={totalGeral} />
    </div>
  );
};

export default App;
