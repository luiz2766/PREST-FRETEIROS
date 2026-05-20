
import React from 'react';
import { RomaneioItem, Regiao } from '../types';
import { Trash2, AlertCircle } from 'lucide-react';

interface DataTableProps {
  items: RomaneioItem[];
  onUpdateItem: (id: string, updates: Partial<RomaneioItem>) => void;
  onDeleteItem: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ items, onUpdateItem, onDeleteItem }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-black uppercase tracking-tight border-b text-[10px]">
            <tr>
              <th className="px-4 py-4 min-w-[120px]">Data</th>
              <th className="px-4 py-4 min-w-[100px]">Romaneio</th>
              <th className="px-4 py-4 min-w-[160px]">Região</th>
              <th className="px-4 py-4 min-w-[140px]">Produtos</th>
              <th className="px-4 py-4 min-w-[60px]">CX</th>
              <th className="px-4 py-4 min-w-[60px]">UN</th>
              <th className="px-4 py-4 min-w-[100px]">KM Saída</th>
              <th className="px-4 py-4 min-w-[100px]">KM Chegada</th>
              <th className="px-4 py-4 min-w-[100px]">Diarista</th>
              <th className="px-4 py-4 min-w-[120px]">Vlr Frete</th>
              <th className="px-4 py-4 min-w-[100px]">Vale</th>
              <th className="px-4 py-4 min-w-[120px]">Total Líq</th>
              <th className="px-4 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isKmError = item.kmSaida !== null && item.kmChegada !== null && item.kmChegada < item.kmSaida;
              
              return (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="date"
                      value={item.data}
                      onChange={(e) => onUpdateItem(item.id, { data: e.target.value })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-medium"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.romaneio}
                      placeholder="Nº..."
                      onChange={(e) => onUpdateItem(item.id, { romaneio: e.target.value })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-bold text-gray-600"
                    />
                  </td>
                  <td className={`px-4 py-3 ${item.regiao === Regiao.NOT_FOUND ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center gap-1">
                      <select
                        value={item.regiao}
                        onChange={(e) => onUpdateItem(item.id, { regiao: e.target.value as Regiao })}
                        className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-black text-xs ${item.regiao === Regiao.NOT_FOUND ? 'text-red-600' : 'text-gray-900'}`}
                      >
                        {Object.values(Regiao).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {item.regiao === Regiao.NOT_FOUND && <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={item.produtos}
                      placeholder="Produtos..."
                      onChange={(e) => onUpdateItem(item.id, { produtos: e.target.value })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none italic text-gray-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantidadeCx || ''}
                      onChange={(e) => onUpdateItem(item.id, { quantidadeCx: Number(e.target.value) })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none text-center"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={item.quantidadeUn || ''}
                      onChange={(e) => onUpdateItem(item.id, { quantidadeUn: Number(e.target.value) })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none text-center"
                    />
                  </td>
                  <td className={`px-4 py-3 ${isKmError ? 'bg-red-50' : ''}`}>
                    <input
                      type="number"
                      value={item.kmSaida ?? ''}
                      placeholder="-"
                      onChange={(e) => onUpdateItem(item.id, { kmSaida: e.target.value === '' ? null : Number(e.target.value) })}
                      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none text-xs ${isKmError ? 'text-red-600' : ''}`}
                    />
                  </td>
                  <td className={`px-4 py-3 ${isKmError ? 'bg-red-50' : ''}`}>
                    <input
                      type="number"
                      value={item.kmChegada ?? ''}
                      placeholder="-"
                      onChange={(e) => onUpdateItem(item.id, { kmChegada: e.target.value === '' ? null : Number(e.target.value) })}
                      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none text-xs ${isKmError ? 'text-red-600' : ''}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-[10px] text-gray-400 mr-1">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.diarista || ''}
                        onChange={(e) => onUpdateItem(item.id, { diarista: Number(e.target.value) })}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-medium"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-blue-600 bg-blue-50/20">
                    {formatCurrency(item.valorFrete)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-[10px] text-red-300 mr-1">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.vale || ''}
                        onChange={(e) => onUpdateItem(item.id, { vale: Number(e.target.value) })}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-black text-red-600"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-gray-900 bg-gray-50/50">
                    {formatCurrency(item.valorTotal)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-300 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-20 text-center text-gray-300 font-bold italic">
                  Aguardando importação de Romaneio ou entrada manual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
