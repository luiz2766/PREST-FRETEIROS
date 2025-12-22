
import React from 'react';
import { ReportHeader, PerfilVeiculo } from '../types';

interface HeaderFormProps {
  header: ReportHeader;
  onChange: (header: ReportHeader) => void;
}

const HeaderForm: React.FC<HeaderFormProps> = ({ header, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...header, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Identificação do Prestador</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Prestador de Serviço</label>
          <input
            type="text"
            name="prestador"
            value={header.prestador}
            onChange={handleChange}
            placeholder="Nome do motorista"
            className="border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Perfil do Veículo</label>
          <select
            name="perfilVeiculo"
            value={header.perfilVeiculo}
            onChange={handleChange}
            className="border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
          >
            <option value={PerfilVeiculo.VUC}>VUC</option>
            <option value={PerfilVeiculo.TOCO}>TOCO</option>
            <option value={PerfilVeiculo.TRUCK}>TRUCK</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Placa</label>
          <input
            type="text"
            name="placa"
            value={header.placa}
            readOnly
            className="border border-gray-200 bg-gray-50 rounded-lg p-2 cursor-not-allowed"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Data de Prestação</label>
          <input
            type="text"
            value={header.dataPrestacao}
            readOnly
            className="border border-gray-200 bg-gray-50 rounded-lg p-2 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderForm;
