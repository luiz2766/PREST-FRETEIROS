
import React from 'react';

interface SummaryFooterProps {
  diarista: number;
  totalFrete: number;
  totalGeral: number;
}

const SummaryFooter: React.FC<SummaryFooterProps> = ({ diarista, totalFrete, totalGeral }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-sm font-semibold text-gray-500 uppercase">Diarista Ajudante</span>
        <span className={`text-3xl font-bold mt-2 ${diarista > 0 ? 'text-green-600' : 'text-gray-400'}`}>
          {formatCurrency(diarista)}
        </span>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
        <span className="text-sm font-semibold text-gray-500 uppercase">Total Valor Frete</span>
        <span className="text-3xl font-bold text-blue-600 mt-2">
          {formatCurrency(totalFrete)}
        </span>
      </div>
      <div className="bg-blue-600 p-6 rounded-xl shadow-md border border-blue-700 flex flex-col justify-between text-white">
        <span className="text-sm font-semibold opacity-80 uppercase">Total Geral (Com Retorno)</span>
        <span className="text-3xl font-bold mt-2">
          {formatCurrency(totalGeral)}
        </span>
      </div>
    </div>
  );
};

export default SummaryFooter;
