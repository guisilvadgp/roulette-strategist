import type { RouletteStats } from '@/types/roulette';

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

export function getNumberColor(n: number): 'red' | 'black' | 'green' {
  if (n === 0) return 'green';
  return RED_NUMBERS.includes(n) ? 'red' : 'black';
}

export function getDuzia(n: number): 1 | 2 | 3 | 0 {
  if (n === 0) return 0;
  if (n <= 12) return 1;
  if (n <= 24) return 2;
  return 3;
}

export function getLinha(n: number): 1 | 2 | 3 | 0 {
  if (n === 0) return 0;
  if (n % 3 === 1) return 1;
  if (n % 3 === 2) return 2;
  return 3;
}

export function calcularEstatisticas(historico: number[]): RouletteStats {
  const stats: RouletteStats = {
    pares: 0, impares: 0,
    vermelhos: 0, pretos: 0, zeros: 0,
    duzia1: 0, duzia2: 0, duzia3: 0,
    linha1: 0, linha2: 0, linha3: 0,
    frequencia: {},
    tendencias: [],
    repeticoes: [],
  };

  for (let i = 0; i <= 36; i++) stats.frequencia[i] = 0;

  historico.forEach((n, idx) => {
    stats.frequencia[n] = (stats.frequencia[n] || 0) + 1;

    if (n === 0) { stats.zeros++; return; }
    if (n % 2 === 0) stats.pares++; else stats.impares++;

    const color = getNumberColor(n);
    if (color === 'red') stats.vermelhos++;
    else stats.pretos++;

    const d = getDuzia(n);
    if (d === 1) stats.duzia1++;
    else if (d === 2) stats.duzia2++;
    else if (d === 3) stats.duzia3++;

    const l = getLinha(n);
    if (l === 1) stats.linha1++;
    else if (l === 2) stats.linha2++;
    else if (l === 3) stats.linha3++;

    // Repetições
    if (idx > 0 && historico[idx - 1] === n) {
      stats.repeticoes.push(n);
    }
  });

  // Tendências
  const ultimos5 = historico.slice(-5);
  const redsLast5 = ultimos5.filter(n => getNumberColor(n) === 'red').length;
  const blacksLast5 = ultimos5.filter(n => getNumberColor(n) === 'black').length;
  const paresLast5 = ultimos5.filter(n => n !== 0 && n % 2 === 0).length;

  if (redsLast5 >= 4) stats.tendencias.push('Sequência de vermelhos');
  if (blacksLast5 >= 4) stats.tendencias.push('Sequência de pretos');
  if (paresLast5 >= 4) stats.tendencias.push('Sequência de pares');
  if (ultimos5.filter(n => n !== 0 && n % 2 !== 0).length >= 4) stats.tendencias.push('Sequência de ímpares');

  // Hot/Cold numbers
  const sorted = Object.entries(stats.frequencia)
    .sort(([, a], [, b]) => b - a);
  if (sorted.length > 0 && sorted[0][1] > 2) {
    stats.tendencias.push(`Número quente: ${sorted[0][0]} (${sorted[0][1]}x)`);
  }

  return stats;
}

export function formatStats(stats: RouletteStats): string {
  return `Par: ${stats.pares} | Ímpar: ${stats.impares}
Vermelho: ${stats.vermelhos} | Preto: ${stats.pretos} | Zero: ${stats.zeros}
Dúzia 1: ${stats.duzia1} | Dúzia 2: ${stats.duzia2} | Dúzia 3: ${stats.duzia3}
Linha 1: ${stats.linha1} | Linha 2: ${stats.linha2} | Linha 3: ${stats.linha3}
Tendências: ${stats.tendencias.length > 0 ? stats.tendencias.join(', ') : 'Nenhuma'}
Repetições: ${stats.repeticoes.length > 0 ? stats.repeticoes.join(', ') : 'Nenhuma'}`;
}
