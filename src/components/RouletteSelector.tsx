import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RouletteTable } from '@/types/roulette';

interface Props {
  vendors: string[];
  vendorTables: RouletteTable[];
  selectedVendor: string | null;
  selectedTable: string | null;
  onVendorChange: (vendor: string) => void;
  onTableChange: (vendor: string, tableId: string) => void;
}

export function RouletteSelector({ vendors, vendorTables, selectedVendor, selectedTable, onVendorChange, onTableChange }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
          Provedor
        </label>
        <Select
          value={selectedVendor || ''}
          onValueChange={(v) => onVendorChange(v)}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder="Selecione o provedor" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {vendors.map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block uppercase tracking-wider">
          Mesa
        </label>
        <Select
          value={selectedTable || ''}
          onValueChange={(id) => {
            if (selectedVendor) onTableChange(selectedVendor, id);
          }}
          disabled={!selectedVendor}
        >
          <SelectTrigger className="bg-secondary border-border">
            <SelectValue placeholder={selectedVendor ? "Selecione a mesa" : "Selecione um provedor primeiro"} />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {vendorTables.map(t => (
              <SelectItem key={t.tableId} value={t.tableId}>{t.tableName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
