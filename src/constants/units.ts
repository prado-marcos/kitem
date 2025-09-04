export const UNIDADES_MEDIDA = [
  'UN',
  'KG',
  'g',
  'L',
  'ml',
  'xícara',
  'colher de sopa',
  'colher de chá',
  'colher de café',
  'copo',
  'taça',
  'concha',
  'pitada',
  'dente',
  'folha',
  'ramo',
  'fatia',
  'pedaço',
  'pacote',
  'sachê',
  'lata',
  'garrafa',
  'caixa',
  'pote',
  'frasco',
  'rolo'
] as const;


export type UnidadeMedida = typeof UNIDADES_MEDIDA[number];

// Opções formatadas para o react-select
export const UNIDADES_MEDIDA_OPTIONS = UNIDADES_MEDIDA.map(un => ({ 
  value: un, 
  label: un 
}));
