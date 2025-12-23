
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
  
  const [header, setHeader] = useState<ReportHeader>({
    prestador: '',
    perfilVeiculo: PerfilVeiculo.VUC,
    placa: '',
    dataPrestacao: '' 
  });

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
      console.error('Erro no processamento do PDF:', error);
      alert('Falha ao ler o PDF. Tente novamente.');
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

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center text-gray-500">Iniciando aplicação...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <span className="p-2 bg-blue-600 text-white rounded-lg"><FileText /></span>
          Prestação de Contas
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold cursor-pointer transition-all shadow-md">
            {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp size={20} />}
            {isProcessing ? 'Lendo PDF...' : 'Importar Romaneio'}
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
          </label>
          <button onClick={() => generateExcel(header, items, totalDiarista, totalFrete, totalGeral)} disabled={items.length === 0} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50">
            <FileSpreadsheet size={20} /> Excel
          </button>
          <button onClick={() => generatePdf(header, items, totalDiarista, totalFrete, totalGeral)} disabled={items.length === 0} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold disabled:opacity-50">
            <FileText size={20} /> PDF
          </button>
        </div>
      </header>

      <HeaderForm header={header} onChange={setHeader} />

      <div className="flex justify-between items-center mb-4 mt-6">
        <h3 className="font-bold text-gray-800">Lançamentos de Frete</h3>
        <button onClick={handleAddItem} className="text-blue-600 hover:underline font-bold text-sm flex items-center gap-1">
          <Plus size={16} /> Adicionar Manualmente
        </button>
      </div>

      <DataTable items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />

      <SummaryFooter diarista={totalDiarista} totalFrete={totalFrete} totalGeral={totalGeral} />
    </div>
  );
};

export default App;
