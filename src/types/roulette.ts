export interface RouletteTable {
  tableId: string;
  tableName: string;
  vendorName: string;
  results: number[];
  gameType?: string;
}

export interface RouletteStats {
  pares: number;
  impares: number;
  vermelhos: number;
  pretos: number;
  zeros: number;
  duzia1: number;
  duzia2: number;
  duzia3: number;
  linha1: number;
  linha2: number;
  linha3: number;
  frequencia: Record<number, number>;
  tendencias: string[];
  repeticoes: number[];
}

export interface AIStrategy {
  estrategia: string;
  alternativa: string;
  justificativa: string;
  confianca: number;
  risco: string;
  loading: boolean;
  error?: string;
}

export interface RouletteState {
  historico: number[];
  mesaAtual: string | null;
  provedor: string | null;
}
