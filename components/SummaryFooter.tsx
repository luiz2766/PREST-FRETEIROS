
import React from 'react';

interface SummaryFooterProps {
  diarista: number;
  totalRetornoZero: number;
  totalFrete: number;
  totalVale: number;
  totalGeral: number;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({ diarista, totalRetornoZero, totalFrete, totalVale, totalGeral }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retorno 0</span>
        <span className={`text-2xl font-black mt-2 ${totalRetornoZero > 0 ? 'text-indigo-600' : 'text-gray-300'}`}>
          {formatCurrency(totalRetornoZero)}
        </span>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outros (Ajudantes)</span>
        <span className={`text-2xl font-black mt-2 ${diarista > 0 ? 'text-emerald-600' : 'text-gray-300'}`}>
          {formatCurrency(diarista)}
        </span>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Vales</span>
        <span className={`text-2xl font-black mt-2 ${totalVale > 0 ? 'text-red-500' : 'text-gray-300'}`}>
          {totalVale > 0 ? `-${formatCurrency(totalVale)}` : formatCurrency(0)}
        </span>
      </div>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Frete</span>
        <span className="text-2xl font-black text-blue-600 mt-2">
          {formatCurrency(totalFrete)}
        </span>
      </div>
      <div className="bg-blue-600 p-5 rounded-xl shadow-lg shadow-blue-100 flex flex-col justify-between text-white">
        <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Líquido a Pagar</span>
        <span className="text-2xl font-black mt-2 shadow-text">
          {formatCurrency(totalGeral)}
        </span>
      </div>
    </div>
  );
};

export default SummaryFooter;
