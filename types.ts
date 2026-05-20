
export enum PerfilVeiculo {
  VUC = 'VUC',
  TOCO = 'TOCO',
  TRUCK = 'TRUCK'
}

export enum Regiao {
  R1 = 'REGIÃO 1',
  R2 = 'REGIÃO 2',
  R3 = 'REGIÃO 3',
  R4 = 'REGIÃO 4',
  R5 = 'REGIÃO 5',
  R6 = 'REGIÃO 6',
  NOT_FOUND = 'REGIÃO NÃO IDENTIFICADA'
}

export interface RomaneioItem {
  id: string;
  data: string;
  romaneio: string;
  regiao: Regiao;
  kmSaida: number | null;
  kmChegada: number | null;
  kmRodado: number;
  retornoZero: number;
  diarista: number;
  valorFrete: number;
  produtos: string;
  quantidadeCx: number;
  quantidadeUn: number;
  vale: number;
  valorTotal: number;
}

export interface ReportHeader {
  id?: string;
  prestador: string;
  perfilVeiculo: PerfilVeiculo;
  placa: string;
  dataPrestacao: string;
  created_at?: string;
}

export interface DashboardStats {
  totalValorFrete: number;
  totalFretes: number;
  mediaFretePorDia: number;
  totalDiarista: number;
  totalVales: number;
  totalGeral: number;
  topRegioes: { regiao: string; total: number }[];
}
