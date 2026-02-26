import type { RouletteTable } from '@/types/roulette';
import { supabase } from '@/integrations/supabase/client';

let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function extractRouletteResults(rawResults: any): number[] {
  if (!rawResults) return [];
  
  if (Array.isArray(rawResults)) {
    return rawResults
      .map((r: any) => {
        if (typeof r === 'number') return r;
        if (typeof r === 'string') return parseInt(r, 10);
        if (r?.result !== undefined) return parseInt(r.result, 10);
        if (r?.number !== undefined) return parseInt(r.number, 10);
        if (r?.value !== undefined) return parseInt(r.value, 10);
        return NaN;
      })
      .filter((n: number) => !isNaN(n) && n >= 0 && n <= 36);
  }
  
  return [];
}

function extractTables(data: any): RouletteTable[] {
  const tables: RouletteTable[] = [];
  
  try {
    const items = data?.liveCasinoApiDataItems || data?.tables || data?.Games || data?.games || 
                  data?.data?.tables || data?.data?.Games ||
                  data?.liveGames || data?.LiveGames || [];
    
    const gameList = Array.isArray(items) ? items : Object.values(items);
    
    for (const game of gameList) {
      if (!game) continue;
      
      const gameType = (game.gameType || game.GameType || game.type || game.category || '').toString().toLowerCase();
      const name = (game.tableName || game.TableName || game.name || game.Name || game.title || '').toString();
      
      const isRoulette = gameType.includes('roulette') || gameType.includes('roleta') ||
                         name.toLowerCase().includes('roulette') || name.toLowerCase().includes('roleta');
      
      if (!isRoulette && gameType !== '') continue;
      
      const results = extractRouletteResults(
        game.results || game.Results || game.history || game.lastResults || game.recentResults || []
      );
      
      tables.push({
        tableId: (game.tableId || game.TableId || game.id || game.Id || game.gameId || Math.random().toString()).toString(),
        tableName: name || 'Mesa sem nome',
        vendorName: (game.vendorname || game.vendorName || game.VendorName || game.vendor || game.provider || game.Provider || 'Desconhecido').toString(),
        results,
        gameType: gameType || 'roulette',
      });
    }
  } catch (e) {
    console.error('[Coletor] Erro ao extrair mesas:', e);
  }
  
  return tables;
}

export async function fetchRouletteTables(signal?: AbortSignal): Promise<RouletteTable[]> {
  try {
    const { data, error } = await supabase.functions.invoke('roulette-proxy', {
      method: 'GET',
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(`Proxy error: ${data.error}`);
    }

    retryCount = 0;
    
    const tables = extractTables(data);
    console.log(`[Coletor] ${tables.length} mesas de roleta encontradas`);
    return tables;
  } catch (error: any) {
    if (error.name === 'AbortError') throw error;
    
    retryCount++;
    console.warn(`[Coletor] Falha na requisição (tentativa ${retryCount}/${MAX_RETRIES}):`, error.message);
    
    if (retryCount <= MAX_RETRIES) {
      await new Promise(r => setTimeout(r, RETRY_DELAY * retryCount));
      return fetchRouletteTables(signal);
    }
    
    retryCount = 0;
    throw new Error(`Falha após ${MAX_RETRIES} tentativas: ${error.message}`);
  }
}
