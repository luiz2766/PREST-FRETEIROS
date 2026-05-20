
import React, { useState, useEffect, useCallback } from 'react';
import HeaderForm from './components/HeaderForm';
import DataTable from './components/DataTable';
import SummaryFooter from './components/SummaryFooter';
import Dashboard from './components/Dashboard';
import { PerfilVeiculo, ReportHeader, RomaneioItem, Regiao, DashboardStats } from './types';
import { FRETE_TABLE } from './constants';
import { parsePdfData } from './services/pdfParser';
import { generateExcel, generatePdf } from './services/exporter';
import { FileUp, FileSpreadsheet, FileText, Plus, Loader2, BarChart3, List, History, Save, Search, X, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'dashboard' | 'history'>('editor');
  const [items, setItems] = useState<RomaneioItem[]>([]);
  
  const [header, setHeader] = useState<ReportHeader>({
    prestador: '',
    perfilVeiculo: PerfilVeiculo.VUC,
    placa: '',
    dataPrestacao: '' 
  });

  // History & Dashboard State
  const [history, setHistory] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    placa: ''
  });

  useEffect(() => {
    setIsMounted(true);
    const today = new Date().toISOString().split('T')[0];
    setHeader(prev => ({
      ...prev,
      dataPrestacao: today
    }));
  }, []);

  const calculateItemValues = (item: Partial<RomaneioItem>, perfil: PerfilVeiculo): RomaneioItem => {
    const kmSaida = item.kmSaida ?? null;
    const kmChegada = item.kmChegada ?? null;
    const kmRodado = (kmSaida !== null && kmChegada !== null) ? (kmChegada - kmSaida) : 0;
    const valorFrete = FRETE_TABLE[item.regiao || Regiao.NOT_FOUND][perfil];
    
    // Total = Freight + Diarista - Vale
    const valorTotal = valorFrete + (item.diarista || 0) - (item.vale || 0);

    return {
      id: item.id || Math.random().toString(36).substr(2, 9),
      data: item.data || new Date().toISOString().split('T')[0],
      romaneio: item.romaneio || '',
      regiao: item.regiao || Regiao.NOT_FOUND,
      kmSaida,
      kmChegada,
      kmRodado,
      retornoZero: item.retornoZero || 0,
      diarista: item.diarista || 0,
      valorFrete,
      produtos: item.produtos || '',
      quantidadeCx: item.quantidadeCx || 0,
      quantidadeUn: item.quantidadeUn || 0,
      vale: item.vale || 0,
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
      data: new Date().toISOString().split('T')[0],
    };
    setItems(prev => [...prev, calculateItemValues(newItem, header.perfilVeiculo)]);
  };

  const saveToHistory = async () => {
    if (!header.prestador || !header.placa || items.length === 0) {
      alert('Preencha o prestador, placa e adicione itens antes de salvar.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ header, items })
      });
      if (response.ok) {
        alert('Prestação de contas salva com sucesso!');
        setItems([]);
        setHeader(prev => ({ ...prev, placa: '', prestador: '' }));
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (err) {
      alert('Erro ao salvar no banco de dados.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setDashboardStats(data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/reports?${params.toString()}`);
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
  }, [filters]);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchDashboard();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab, fetchDashboard, fetchHistory]);

  const totalFrete = items.reduce((sum, i) => sum + i.valorFrete, 0);
  const totalDiarista = items.reduce((sum, i) => sum + i.diarista, 0);
  const totalVale = items.reduce((sum, i) => sum + i.vale, 0);
  const totalGeral = items.reduce((sum, i) => sum + i.valorTotal, 0);

  if (!isMounted) {
    return <div className="h-screen flex items-center justify-center text-gray-500">Iniciando aplicação...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto bg-gray-50/30">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <span className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-lg shadow-blue-200">
              <FileText size={28} />
            </span>
            Prestação de Contas
          </h1>
          <p className="text-gray-400 text-sm font-medium ml-1">Controle Profissional de Fretes e Romaneios</p>
        </div>

        <nav className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <List size={18} /> Editor
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <BarChart3 size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <History size={18} /> Histórico
          </button>
        </nav>
      </header>

      {activeTab === 'editor' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border border-blue-100 px-6 py-3 rounded-2xl font-black cursor-pointer transition-all shadow-sm hover:shadow-md">
                {isProcessing ? <Loader2 className="animate-spin" /> : <FileUp size={22} />}
                {isProcessing ? 'Processando...' : 'Importar Romaneio PDF'}
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" disabled={isProcessing} />
              </label>
              
              <button 
                onClick={saveToHistory} 
                disabled={isSaving || items.length === 0}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                Salvar Histórico
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => generateExcel(header, items, totalDiarista, totalVale, totalFrete, totalGeral)} disabled={items.length === 0} className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl transition-all shadow-sm">
                <FileSpreadsheet size={24} />
              </button>
              <button onClick={() => generatePdf(header, items, totalDiarista, totalVale, totalFrete, totalGeral)} disabled={items.length === 0} className="p-3 bg-white hover:bg-red-50 text-red-600 border border-red-100 rounded-xl transition-all shadow-sm">
                <FileText size={24} />
              </button>
            </div>
          </div>

          <HeaderForm header={header} onChange={setHeader} />

          <div className="flex justify-between items-center mb-4 mt-10">
            <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
              Lançamentos de Frete
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-lg uppercase tracking-widest">{items.length} Itens</span>
            </h3>
            <button onClick={handleAddItem} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 hover:bg-blue-100 transition-all">
              <Plus size={18} /> ADICIONAR MANUAL
            </button>
          </div>

          <DataTable items={items} onUpdateItem={handleUpdateItem} onDeleteItem={handleDeleteItem} />

          <SummaryFooter diarista={totalDiarista} totalFrete={totalFrete} totalVale={totalVale} totalGeral={totalGeral} />
        </div>
      )}

      {activeTab === 'dashboard' && dashboardStats && (
        <Dashboard stats={dashboardStats} />
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in duration-500">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> Período Inicial</label>
              <input 
                type="date" 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                value={filters.startDate}
                onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12}/> Período Final</label>
              <input 
                type="date" 
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                value={filters.endDate}
                onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Search size={12}/> Pesquisar Placa</label>
              <input 
                type="text" 
                placeholder="ABC-1234"
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium uppercase"
                value={filters.placa}
                onChange={e => setFilters(prev => ({ ...prev, placa: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={fetchHistory}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Search size={18} /> Filtrar
              </button>
              <button 
                onClick={() => setFilters({ startDate: '', endDate: '', placa: '' })}
                className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
              >
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {history.map((report) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl font-black">
                      {report.placa}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-800">{report.prestador}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase">{report.perfil_veiculo} • {new Date(report.data_prestacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Líquido</p>
                    <p className="text-2xl font-black text-blue-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        report.report_items.reduce((sum: number, i: any) => sum + (Number(i.valor_total) || 0), 0)
                      )}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-white text-gray-400 font-black uppercase tracking-tighter border-b border-gray-50">
                      <tr>
                        <th className="px-6 py-4">Data</th>
                        <th className="px-6 py-4">Romaneio</th>
                        <th className="px-6 py-4">Região</th>
                        <th className="px-6 py-4">Produtos</th>
                        <th className="px-6 py-4 text-right">Frete</th>
                        <th className="px-6 py-4 text-right">Vale</th>
                        <th className="px-6 py-4 text-right">Líquido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {report.report_items.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{new Date(item.data).toLocaleDateString('pt-BR')}</td>
                          <td className="px-6 py-4 font-bold text-gray-500">{item.romaneio}</td>
                          <td className="px-6 py-4">{item.regiao}</td>
                          <td className="px-6 py-4 italic text-gray-400">{item.produtos || '-'}</td>
                          <td className="px-6 py-4 text-right">R$ {item.valor_frete}</td>
                          <td className="px-6 py-4 text-right text-red-500">-R$ {item.vale}</td>
                          <td className="px-6 py-4 text-right font-black text-gray-900">R$ {item.valor_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="bg-white p-20 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-50 text-gray-300 rounded-2xl">
                  <History size={48} />
                </div>
                <p className="text-gray-400 font-bold">Nenhum registro encontrado no histórico.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
