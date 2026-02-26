import { useState, useEffect, useRef, useCallback } from 'react';
import type { RouletteTable, AIStrategy } from '@/types/roulette';
import { fetchRouletteTables } from '@/utils/rouletteApi';
import { analisarComIA } from '@/utils/rouletteAI';

const POLL_INTERVAL = 5000;
const MAX_HISTORICO = 100;

export function useRouletteData() {
  const [tables, setTables] = useState<RouletteTable[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [historico, setHistorico] = useState<number[]>([]);
  const [strategy, setStrategy] = useState<AIStrategy>({
    estrategia: '', alternativa: '', justificativa: '',
    confianca: 0, risco: '', loading: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const aiAbortRef = useRef<AbortController | null>(null);
  const prevResultsRef = useRef<string>('');

  // Fetch tables
  const fetchData = useCallback(async () => {
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const data = await fetchRouletteTables(abortRef.current.signal);
      setTables(data);
      setError(null);
      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e.message);
        setIsLoading(false);
      }
    }
  }, []);

  // Polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchData]);

  // Get current table
  const currentTable = tables.find(
    t => t.tableId === selectedTable && t.vendorName === selectedVendor
  );

  // Update historico when table results change
  useEffect(() => {
    if (!currentTable) return;

    const resultsKey = currentTable.results.join(',');
    if (resultsKey === prevResultsRef.current) return;
    prevResultsRef.current = resultsKey;

    setHistorico(prev => {
      const newResults = currentTable.results.filter(
        n => n >= 0 && n <= 36
      );
      // Find new numbers not in prev
      const combined = [...prev];
      for (const n of newResults) {
        if (combined.length === 0 || combined[combined.length - 1] !== n || newResults.length > prev.length) {
          // Simple approach: use API results as truth, merge new ones
        }
      }
      // Use API results merged with existing history
      const merged = [...prev];
      if (newResults.length > 0) {
        const lastKnown = prev.length > 0 ? prev[prev.length - 1] : null;
        const lastIdx = lastKnown !== null ? newResults.lastIndexOf(lastKnown) : -1;
        const toAdd = lastIdx >= 0 ? newResults.slice(lastIdx + 1) : 
                      prev.length === 0 ? newResults : newResults.slice(-1);
        merged.push(...toAdd.filter(n => n >= 0 && n <= 36));
      }
      return merged.slice(-MAX_HISTORICO);
    });
  }, [currentTable]);

  // Trigger AI analysis when historico changes
  useEffect(() => {
    if (!currentTable || historico.length < 5) return;

    const analyze = async () => {
      aiAbortRef.current?.abort();
      aiAbortRef.current = new AbortController();
      
      setStrategy(prev => ({ ...prev, loading: true, error: undefined }));
      
      try {
        const result = await analisarComIA(
          currentTable.tableName,
          currentTable.vendorName,
          historico,
          aiAbortRef.current.signal,
        );
        setStrategy(result);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setStrategy(prev => ({ ...prev, loading: false, error: e.message }));
        }
      }
    };

    const debounce = setTimeout(analyze, 1000);
    return () => {
      clearTimeout(debounce);
      aiAbortRef.current?.abort();
    };
  }, [historico, currentTable]);

  // Select table handler - resets everything
  const selectTable = useCallback((vendor: string, tableId: string) => {
    setSelectedVendor(vendor);
    setSelectedTable(tableId);
    setHistorico([]);
    prevResultsRef.current = '';
    setStrategy({
      estrategia: '', alternativa: '', justificativa: '',
      confianca: 0, risco: '', loading: false,
    });
    aiAbortRef.current?.abort();
  }, []);

  // Get unique vendors
  const vendors = [...new Set(tables.map(t => t.vendorName))];
  const vendorTables = tables.filter(t => t.vendorName === selectedVendor);

  return {
    tables, vendors, vendorTables, currentTable,
    selectedVendor, selectedTable, selectTable, setSelectedVendor,
    historico, strategy, isLoading, error, lastUpdate,
  };
}
