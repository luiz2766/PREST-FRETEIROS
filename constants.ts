
import { Regiao, PerfilVeiculo } from './types';

export const FRETE_TABLE: Record<Regiao, Record<PerfilVeiculo, number>> = {
  [Regiao.R1]: { [PerfilVeiculo.TOQUINHO]: 622.44, [PerfilVeiculo.TOCO]: 681.12, [PerfilVeiculo.TRUCK]: 782.49 },
  [Regiao.R2]: { [PerfilVeiculo.TOQUINHO]: 661.56, [PerfilVeiculo.TOCO]: 738.36, [PerfilVeiculo.TRUCK]: 848.29 },
  [Regiao.R3]: { [PerfilVeiculo.TOQUINHO]: 748.70, [PerfilVeiculo.TOCO]: 860.74, [PerfilVeiculo.TRUCK]: 992.34 },
  [Regiao.R4]: { [PerfilVeiculo.TOQUINHO]: 729.14, [PerfilVeiculo.TOCO]: 832.29, [PerfilVeiculo.TRUCK]: 992.34 },
  [Regiao.R5]: { [PerfilVeiculo.TOQUINHO]: 798.50, [PerfilVeiculo.TOCO]: 933.66, [PerfilVeiculo.TRUCK]: 1077.71 },
  [Regiao.R6]: { [PerfilVeiculo.TOQUINHO]: 882.08, [PerfilVeiculo.TOCO]: 1051.03, [PerfilVeiculo.TRUCK]: 1214.64 },
  [Regiao.NOT_FOUND]: { [PerfilVeiculo.TOQUINHO]: 0, [PerfilVeiculo.TOCO]: 0, [PerfilVeiculo.TRUCK]: 0 },
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
