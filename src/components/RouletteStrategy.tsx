import type { AIStrategy } from '@/types/roulette';
import { Loader2, AlertTriangle, Brain, Shield, TrendingUp } from 'lucide-react';

interface Props {
  strategy: AIStrategy;
  historicoLength: number;
}

function ConfidenceMeter({ value }: { value: number }) {
  const color = value >= 70 ? 'bg-primary' : value >= 40 ? 'bg-accent' : 'bg-destructive';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">Confiança</span>
        <span className="font-mono font-bold text-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function RiskBadge({ risco }: { risco: string }) {
  const r = risco.toLowerCase();
  const color = r.includes('baixo') ? 'bg-primary/20 text-primary' :
                r.includes('alto') ? 'bg-destructive/20 text-destructive' :
                'bg-accent/20 text-accent';
  return (
    <span className={`${color} text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1`}>
      <Shield className="w-3 h-3" />
      Risco: {risco}
    </span>
  );
}

export function RouletteStrategy({ strategy, historicoLength }: Props) {
  if (historicoLength < 5) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Brain className="w-10 h-10 text-muted-foreground mb-3 animate-pulse-slow" />
        <p className="text-sm text-muted-foreground">
          Aguardando mínimo de 5 números para iniciar análise...
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {historicoLength}/5 números coletados
        </p>
      </div>
    );
  }

  if (strategy.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
        <p className="text-sm text-muted-foreground">Analisando padrões com IA...</p>
      </div>
    );
  }

  if (strategy.error) {
    return (
      <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-destructive">Erro na análise</p>
          <p className="text-xs text-muted-foreground mt-1">{strategy.error}</p>
        </div>
      </div>
    );
  }

  if (!strategy.estrategia) return null;

  return (
    <div className="space-y-4 animate-slide-in">
      {/* Main strategy */}
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h4 className="text-xs text-primary uppercase tracking-wider font-semibold">Estratégia Principal</h4>
        </div>
        <p className="text-sm text-foreground font-medium leading-relaxed">{strategy.estrategia}</p>
      </div>

      {/* Alternative */}
      {strategy.alternativa && strategy.alternativa !== '-' && (
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Alternativa</h4>
          <p className="text-sm text-foreground leading-relaxed">{strategy.alternativa}</p>
        </div>
      )}

      {/* Justification */}
      {strategy.justificativa && (
        <div className="p-4 rounded-lg bg-secondary border border-border">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">Justificativa</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{strategy.justificativa}</p>
        </div>
      )}

      {/* Confidence + Risk */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <ConfidenceMeter value={strategy.confianca} />
        </div>
        <RiskBadge risco={strategy.risco} />
      </div>
    </div>
  );
}
