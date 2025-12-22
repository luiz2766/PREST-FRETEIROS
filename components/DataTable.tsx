
import React from 'react';
import { RomaneioItem, Regiao } from '../types';
import { Trash2, AlertCircle, Info } from 'lucide-react';

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
            <tr>
              <th className="px-4 py-3 min-w-[120px]">Data</th>
              <th className="px-4 py-3 min-w-[100px]">Romaneio</th>
              <th className="px-4 py-3 min-w-[150px]">Região</th>
              <th className="px-4 py-3 min-w-[100px]">KM Saída</th>
              <th className="px-4 py-3 min-w-[100px]">KM Chegada</th>
              <th className="px-4 py-3 min-w-[100px]">KM Rodado</th>
              <th className="px-4 py-3 min-w-[100px]">Diarista</th>
              <th className="px-4 py-3 min-w-[100px]">Retorno 0</th>
              <th className="px-4 py-3 min-w-[120px]">Valor Frete</th>
              <th className="px-4 py-3 min-w-[120px]">Valor Total</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => {
              const isKmError = item.kmSaida !== null && item.kmChegada !== null && item.kmChegada < item.kmSaida;
              
              return (
                <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.data}
                      onChange={(e) => onUpdateItem(item.id, { data: e.target.value })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.romaneio}
                      onChange={(e) => onUpdateItem(item.id, { romaneio: e.target.value })}
                      className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none"
                    />
                  </td>
                  <td className={`px-4 py-2 ${item.regiao === Regiao.NOT_FOUND ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.regiao}
                        onChange={(e) => onUpdateItem(item.id, { regiao: e.target.value as Regiao })}
                        className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none font-medium ${item.regiao === Regiao.NOT_FOUND ? 'text-red-600' : ''}`}
                      >
                        {Object.values(Regiao).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {item.regiao === Regiao.NOT_FOUND && <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className={`px-4 py-2 ${isKmError ? 'bg-red-50' : ''}`}>
                    <input
                      type="number"
                      value={item.kmSaida ?? ''}
                      placeholder="-"
                      onChange={(e) => onUpdateItem(item.id, { kmSaida: e.target.value === '' ? null : Number(e.target.value) })}
                      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none ${isKmError ? 'text-red-600' : ''}`}
                    />
                  </td>
                  <td className={`px-4 py-2 ${isKmError ? 'bg-red-50' : ''}`}>
                    <input
                      type="number"
                      value={item.kmChegada ?? ''}
                      placeholder="-"
                      onChange={(e) => onUpdateItem(item.id, { kmChegada: e.target.value === '' ? null : Number(e.target.value) })}
                      className={`w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none ${isKmError ? 'text-red-600' : ''}`}
                    />
                  </td>
                  <td className={`px-4 py-2 font-medium ${isKmError ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50/50'}`}>
                    <div className="flex items-center justify-between">
                      {item.kmRodado}
                      {/* Fixed: Moved 'title' to span wrapper because Lucide icon components do not support 'title' in their props */}
                      {isKmError && (
                        <span title="KM Chegada menor que Saída">
                          <Info size={14} className="text-red-400" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      <span className="mr-1 text-gray-400 text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.diarista}
                        onChange={(e) => onUpdateItem(item.id, { diarista: Number(e.target.value) })}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                     <div className="flex items-center">
                      <span className="mr-1 text-gray-400 text-xs">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={item.retornoZero}
                        onChange={(e) => onUpdateItem(item.id, { retornoZero: Number(e.target.value) })}
                        className="w-full bg-transparent border border-transparent hover:border-gray-300 focus:border-blue-500 rounded p-1 outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 font-semibold text-blue-600 bg-gray-50/50">
                    {formatCurrency(item.valorFrete)}
                  </td>
                  <td className="px-4 py-2 font-bold text-gray-900 bg-gray-50/50">
                    {formatCurrency(item.valorTotal)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-400 italic">
                  Nenhum dado importado. Faça o upload de um PDF para começar.
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
