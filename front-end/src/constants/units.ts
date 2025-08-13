export const UNIDADES_MEDIDA = [
  'un', 'kg', 'g', 'l', 'ml', 'xícara', 'colher', 'pitada', 'dente', 'folha'
] as const;

export type UnidadeMedida = typeof UNIDADES_MEDIDA[number];

// Opções formatadas para o react-select
export const UNIDADES_MEDIDA_OPTIONS = UNIDADES_MEDIDA.map(un => ({ 
  value: un, 
  label: un 
}));
