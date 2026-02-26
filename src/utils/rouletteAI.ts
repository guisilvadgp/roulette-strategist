import type { AIStrategy } from '@/types/roulette';
import { formatStats, calcularEstatisticas } from './rouletteStats';

const POLLINATIONS_URL = 'https://text.pollinations.ai/';

export async function analisarComIA(
  tableName: string,
  vendorName: string,
  historico: number[],
  signal?: AbortSignal,
): Promise<AIStrategy> {
  const ultimos10 = historico.slice(-10);
  const stats = calcularEstatisticas(historico);
  const statsText = formatStats(stats);

  const prompt = `Você é um analista profissional de roleta.

Mesa: ${tableName}
Provedor: ${vendorName}

Últimos 10 números:
${ultimos10.join(', ')}

Histórico completo (${historico.length} números):
${historico.join(', ')}

Estatísticas:
${statsText}

Analise padrões, frequência, tendência e ciclos.
Sugira:
- Par ou Ímpar
- Linha
- Direto (10 números)
- Dúzia

Retorne EXATAMENTE neste formato:
Estratégia: [sua sugestão principal]
Alternativa: [sugestão secundária]
Justificativa: [explicação técnica]
Nível de confiança (0 a 100): [número]
Risco: [baixo/médio/alto]

Seja objetivo, técnico e conservador.`;

  try {
    const response = await fetch(POLLINATIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Você é um analista estatístico de roleta. Responda de forma técnica e objetiva.' },
          { role: 'user', content: prompt },
        ],
        model: 'openai',
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 400,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const text = await response.text();
    return parseAIResponse(text);
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    console.error('[IA] Erro na análise:', error);
    return {
      estrategia: 'Análise indisponível',
      alternativa: '-',
      justificativa: `Erro: ${error.message}`,
      confianca: 0,
      risco: 'N/A',
      loading: false,
      error: error.message,
    };
  }
}

function parseAIResponse(text: string): AIStrategy {
  const estrategia = extractField(text, 'Estratégia') || 'Sem análise';
  const alternativa = extractField(text, 'Alternativa') || '-';
  const justificativa = extractField(text, 'Justificativa') || text.slice(0, 200);
  const confiancaRaw = extractField(text, 'Nível de confiança') || extractField(text, 'Confiança') || '0';
  const risco = extractField(text, 'Risco') || 'médio';
  
  const confianca = Math.min(100, Math.max(0, parseInt(confiancaRaw.replace(/[^\d]/g, '')) || 0));

  return {
    estrategia,
    alternativa,
    justificativa,
    confianca,
    risco: risco.toLowerCase(),
    loading: false,
  };
}

function extractField(text: string, field: string): string | null {
  // Try "Field: value" pattern
  const regex = new RegExp(`${field}[^:]*:\\s*(.+?)(?=\\n[A-ZÀ-Ú]|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}
