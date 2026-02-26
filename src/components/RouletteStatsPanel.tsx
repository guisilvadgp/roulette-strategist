import { calcularEstatisticas } from '@/utils/rouletteStats';

interface Props {
  historico: number[];
}

function StatBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-semibold text-foreground">{value} <span className="text-muted-foreground">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function RouletteStatsPanel({ historico }: Props) {
  if (historico.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Aguardando dados para análise estatística...
      </div>
    );
  }

  const stats = calcularEstatisticas(historico);
  const total = historico.length;
  const nonZero = total - stats.zeros;

  // Top 5 most frequent
  const topFreq = Object.entries(stats.frequencia)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Cor</h4>
          <StatBar label="Vermelho" value={stats.vermelhos} total={nonZero} color="bg-roulette-red" />
          <StatBar label="Preto" value={stats.pretos} total={nonZero} color="bg-foreground" />
          <StatBar label="Zero" value={stats.zeros} total={total} color="bg-roulette-green" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Par/Ímpar</h4>
          <StatBar label="Par" value={stats.pares} total={nonZero} color="bg-primary" />
          <StatBar label="Ímpar" value={stats.impares} total={nonZero} color="bg-accent" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Dúzias</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '1ª (1-12)', value: stats.duzia1 },
            { label: '2ª (13-24)', value: stats.duzia2 },
            { label: '3ª (25-36)', value: stats.duzia3 },
          ].map((d) => (
            <div key={d.label} className="bg-secondary rounded-lg p-3 text-center">
              <div className="text-lg font-mono font-bold text-foreground">{d.value}</div>
              <div className="text-xs text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Linhas</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Linha 1', value: stats.linha1 },
            { label: 'Linha 2', value: stats.linha2 },
            { label: 'Linha 3', value: stats.linha3 },
          ].map((l) => (
            <div key={l.label} className="bg-secondary rounded-lg p-3 text-center">
              <div className="text-lg font-mono font-bold text-foreground">{l.value}</div>
              <div className="text-xs text-muted-foreground">{l.label}</div>
            </div>
          ))}
        </div>
      </div>

      {topFreq.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Números Mais Frequentes</h4>
          <div className="flex gap-2">
            {topFreq.map(([num, count]) => (
              <div key={num} className="bg-secondary rounded-lg px-3 py-2 text-center">
                <div className="font-mono font-bold text-foreground">{num}</div>
                <div className="text-xs text-muted-foreground">{count}x</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.tendencias.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tendências</h4>
          <div className="flex flex-wrap gap-2">
            {stats.tendencias.map((t, i) => (
              <span key={i} className="bg-primary/20 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
