import type { RouletteTable } from '@/types/roulette';

const API_URL = 'https://www.sportingbet.bet.br/pt-br/games/api/LiveCasino/GetData?isSitecoreInfoRequired=false';

const HEADERS: Record<string, string> = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  'expires': '0',
  'pragma': 'no-cache',
  'sec-ch-ua': '"Not:A-Brand";v="99", "Google Chrome";v="145", "Chromium";v="145"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'x-bwin-browser-url': 'https://www.sportingbet.bet.br/pt-br/games/livecasino',
  'x-bwin-casino-api': 'prod',
  'x-device-type': 'desktop',
  'x-from-product': 'host-app',
};

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
    // Try various data structures
    const items = data?.tables || data?.Games || data?.games || 
                  data?.data?.tables || data?.data?.Games ||
                  data?.liveGames || data?.LiveGames || [];
    
    const gameList = Array.isArray(items) ? items : Object.values(items);
    
    for (const game of gameList) {
      if (!game) continue;
      
      const gameType = (game.gameType || game.GameType || game.type || game.category || '').toString().toLowerCase();
      const name = (game.tableName || game.TableName || game.name || game.Name || game.title || '').toString();
      
      // Filter for roulette tables
      const isRoulette = gameType.includes('roulette') || gameType.includes('roleta') ||
                         name.toLowerCase().includes('roulette') || name.toLowerCase().includes('roleta');
      
      if (!isRoulette && gameType !== '') continue;
      
      const results = extractRouletteResults(
        game.results || game.Results || game.history || game.lastResults || game.recentResults || []
      );
      
      tables.push({
        tableId: (game.tableId || game.TableId || game.id || game.Id || game.gameId || Math.random().toString()).toString(),
        tableName: name || 'Mesa sem nome',
        vendorName: (game.vendorName || game.VendorName || game.vendor || game.provider || game.Provider || 'Desconhecido').toString(),
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
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: HEADERS,
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
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
