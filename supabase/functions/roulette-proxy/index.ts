import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: HEADERS,
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Proxy error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
