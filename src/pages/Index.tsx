import { useRouletteData } from '@/hooks/useRouletteData';
import { RouletteSelector } from '@/components/RouletteSelector';
import { RouletteNumbers, RouletteHistoryFull } from '@/components/RouletteNumbers';
import { RouletteStatsPanel } from '@/components/RouletteStatsPanel';
import { RouletteStrategy } from '@/components/RouletteStrategy';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';
import { Loader2, Radio, RefreshCw, Wifi, WifiOff } from 'lucide-react';

const Index = () => {
  const {
    vendors, vendorTables, currentTable,
    selectedVendor, selectedTable, selectTable, setSelectedVendor,
    historico, strategy, isLoading, error, lastUpdate,
  } = useRouletteData();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Radio className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">Roulette AI</h1>
              <p className="text-xs text-muted-foreground">Análise em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground font-mono">
                {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            )}
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
              error ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'
            }`}>
              {error ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3" />}
              {error ? 'Offline' : 'Ao vivo'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <LegalDisclaimer />

        {/* Selector */}
        <section className="bg-card rounded-xl border border-border p-5">
          <RouletteSelector
            vendors={vendors}
            vendorTables={vendorTables}
            selectedVendor={selectedVendor}
            selectedTable={selectedTable}
            onVendorChange={(v) => {
              setSelectedVendor(v);
            }}
            onTableChange={selectTable}
          />
        </section>

        {isLoading && !currentTable && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Conectando ao cassino ao vivo...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5 text-center">
            <WifiOff className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-medium">Erro de conexão</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              A API pode estar bloqueando requisições do navegador (CORS). Tentando reconectar automaticamente...
            </p>
          </div>
        )}

        {!isLoading && !error && vendors.length === 0 && (
          <div className="bg-secondary rounded-xl p-8 text-center">
            <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma mesa de roleta encontrada.</p>
            <p className="text-xs text-muted-foreground mt-1">Verifique a API ou tente novamente.</p>
          </div>
        )}

        {currentTable && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Numbers & History */}
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-card rounded-xl border border-border p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">{currentTable.tableName}</h2>
                  <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{currentTable.vendorName}</span>
                </div>
                <RouletteNumbers historico={historico} title="Últimos 10" />
                <div className="border-t border-border pt-4">
                  <RouletteHistoryFull historico={historico} />
                </div>
              </section>
            </div>

            {/* Center column - Stats */}
            <div className="lg:col-span-1">
              <section className="bg-card rounded-xl border border-border p-5">
                <h2 className="text-sm font-semibold text-foreground mb-4">Estatísticas</h2>
                <RouletteStatsPanel historico={historico} />
              </section>
            </div>

            {/* Right column - AI Strategy */}
            <div className="lg:col-span-1">
              <section className="bg-card rounded-xl border border-border p-5 glow-primary">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <h2 className="text-sm font-semibold text-foreground">Estratégia IA</h2>
                </div>
                <RouletteStrategy strategy={strategy} historicoLength={historico.length} />
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
