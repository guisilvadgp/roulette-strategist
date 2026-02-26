import { AlertTriangle } from 'lucide-react';

export function LegalDisclaimer() {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/10 border border-accent/20">
      <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
      <p className="text-xs text-accent/80 leading-relaxed">
        Este sistema utiliza análise estatística. <strong className="text-accent">Não garante lucro.</strong> Jogue com responsabilidade.
      </p>
    </div>
  );
}
