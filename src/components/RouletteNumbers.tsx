import { getNumberColor } from '@/utils/rouletteStats';

interface Props {
  historico: number[];
  title?: string;
}

function NumberBall({ n }: { n: number }) {
  const color = getNumberColor(n);
  const bgClass = color === 'red' ? 'bg-roulette-red glow-red' :
                  color === 'green' ? 'bg-roulette-green glow-primary' :
                  'bg-roulette-black';
  const textClass = 'text-primary-foreground';

  return (
    <div className={`${bgClass} ${textClass} w-9 h-9 rounded-full flex items-center justify-center text-sm font-mono font-bold shrink-0 transition-all duration-200`}>
      {n}
    </div>
  );
}

export function RouletteNumbers({ historico, title = "Últimos Números" }: Props) {
  const ultimos10 = historico.slice(-10).reverse();
  
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        {title}
      </h3>
      {ultimos10.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aguardando dados...</p>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {ultimos10.map((n, i) => (
            <div key={i} className="animate-slide-in" style={{ animationDelay: `${i * 50}ms` }}>
              <NumberBall n={n} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function RouletteHistoryFull({ historico }: { historico: number[] }) {
  return (
    <div>
      <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
        Histórico Completo ({historico.length})
      </h3>
      {historico.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum número registrado.</p>
      ) : (
        <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto pr-1">
          {[...historico].reverse().map((n, i) => (
            <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0"
              style={{
                backgroundColor: getNumberColor(n) === 'red' ? 'hsl(var(--roulette-red))' :
                                 getNumberColor(n) === 'green' ? 'hsl(var(--roulette-green))' :
                                 'hsl(var(--roulette-black))',
                color: 'white',
              }}
            >
              {n}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
