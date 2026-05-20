import React, { useMemo } from 'react';
import { DashboardStats } from '../types';
import { TrendingUp, Package, MapPin, Calendar, DollarSign, ArrowDownRight } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const cards = [
    { title: 'Valor Total Fretes', value: formatCurrency(stats.totalValorFrete), icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Quantidade de Fretes', value: stats.totalFretes.toString(), icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Média de Fretes / Dia', value: stats.mediaFretePorDia.toFixed(1), icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Vales (Deduções)', value: `-${formatCurrency(stats.totalVales)}`, icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50' },
    { title: 'Diaristas', value: formatCurrency(stats.totalDiarista), icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Líquido', value: formatCurrency(stats.totalGeral), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-4 ${card.bg} ${card.color} rounded-xl`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <MapPin className="text-blue-500" /> Top 5 Regiões com Mais Fretes
        </h3>
        <div className="space-y-4">
          {stats.topRegioes.map((reg, idx) => (
            <div key={reg.regiao}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{reg.regiao}</span>
                <span className="text-sm font-bold text-gray-900">{reg.total} fretes</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${(reg.total / stats.totalFretes) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {stats.topRegioes.length === 0 && (
            <p className="text-gray-400 italic text-center py-4">Aguardando dados para exibição...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
