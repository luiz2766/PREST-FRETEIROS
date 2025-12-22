
import { Regiao, PerfilVeiculo } from './types';

export const FRETE_TABLE: Record<Regiao, Record<PerfilVeiculo, number>> = {
  [Regiao.R1]: { [PerfilVeiculo.VUC]: 546.00, [PerfilVeiculo.TOCO]: 597.48, [PerfilVeiculo.TRUCK]: 686.40 },
  [Regiao.R2]: { [PerfilVeiculo.VUC]: 580.32, [PerfilVeiculo.TOCO]: 647.40, [PerfilVeiculo.TRUCK]: 744.12 },
  [Regiao.R3]: { [PerfilVeiculo.VUC]: 656.76, [PerfilVeiculo.TOCO]: 755.04, [PerfilVeiculo.TRUCK]: 870.48 },
  [Regiao.R4]: { [PerfilVeiculo.VUC]: 639.60, [PerfilVeiculo.TOCO]: 730.08, [PerfilVeiculo.TRUCK]: 870.48 },
  [Regiao.R5]: { [PerfilVeiculo.VUC]: 700.44, [PerfilVeiculo.TOCO]: 819.00, [PerfilVeiculo.TRUCK]: 945.36 },
  [Regiao.R6]: { [PerfilVeiculo.VUC]: 773.76, [PerfilVeiculo.TOCO]: 921.96, [PerfilVeiculo.TRUCK]: 1065.48 },
  [Regiao.NOT_FOUND]: { [PerfilVeiculo.VUC]: 0, [PerfilVeiculo.TOCO]: 0, [PerfilVeiculo.TRUCK]: 0 },
};

/**
 * Normalization in parser removes accents. 
 * Mapping keys must match the normalized output (UPPERCASE, NO ACCENTS).
 */
export const CIADE_REGIAO_MAP: Record<string, Regiao> = {
  // REGIÃO 1
  'ARAPIRACA': Regiao.R1,
  
  // REGIÃO 2
  'CRAIBAS': Regiao.R2,
  'IGACI': Regiao.R2,
  'FEIRA GRANDE': Regiao.R2,
  'ARAPIRACA ZONA RURAL': Regiao.R2,
  
  // REGIÃO 3
  'PALMEIRA DOS INDIOS': Regiao.R3,
  'BELEM': Regiao.R3,
  'TANQUE D\'ARCA': Regiao.R3,
  'COITE DO NOIA': Regiao.R3,
  'TAQUARANA': Regiao.R3,
  'LIMOEIRO DE ANADIA': Regiao.R3,
  
  // REGIÃO 4
  'GIRAU DO PORCIANO': Regiao.R4,
  'CAMPO ALEGRE': Regiao.R4,
  'TRAIPU': Regiao.R4,
  'OLHO D\'AGUA GRANDE': Regiao.R4,
  'SAO BRAS': Regiao.R4,
  'LAGOA DA CANOA': Regiao.R4,
  
  // REGIÃO 5
  'BATALHA': Regiao.R5,
  'BELO MONTE': Regiao.R5,
  'CACIMBINHAS': Regiao.R5,
  'JACARE DOS HOMENS': Regiao.R5,
  'MONEIROPOLIS': Regiao.R5,
  'MAJOR ISIDORO': Regiao.R5,
  'JARAMATAIA': Regiao.R5,
  'ESTRELA DE ALAGOAS': Regiao.R5,
  'DOIS RIACHOS': Regiao.R5,
  'MINADOR DO NEGRAO': Regiao.R5,
  'QUEBRANGULO': Regiao.R5,
  
  // REGIÃO 6
  'SANTANA DO IPANEMA': Regiao.R6,
  'MARAVILHA': Regiao.R6,
  'POCO DAS TRINCHEIRAS': Regiao.R6,
  'SENADOR RUI PALMEIRA': Regiao.R6,
  'CARNEIROS': Regiao.R6,
  'SAO JOSE DA TAPERA': Regiao.R6,
  'PAO DE ACUCAR': Regiao.R6,
  'PALESTINA': Regiao.R6,
  'OLHO D\'AGUA DAS FLORES': Regiao.R6,
  'OLIVENCA': Regiao.R6,
  'VICOSA': Regiao.R6,
  'ATALAIA': Regiao.R6,
  'CAJUEIRO': Regiao.R6,
  'CAPELA': Regiao.R6,
};
