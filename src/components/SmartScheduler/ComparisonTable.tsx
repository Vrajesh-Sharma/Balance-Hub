import { ConstraintViolation } from '../../soft-computing/types';

interface ComparisonRow {
  name: string;
  fitness: number;
  balanceScore: number;
  productivityScore: number;
  stressScore: number;
  violations: ConstraintViolation[];
}

interface ComparisonTableProps {
  rows: ComparisonRow[];
  className?: string;
}

const METRICS = [
  { key: 'fitness', label: 'Fitness', higher: true },
  { key: 'balanceScore', label: 'Balance', higher: true },
  { key: 'productivityScore', label: 'Productivity', higher: true },
  { key: 'stressScore', label: 'Stress', higher: false },
  { key: 'violations', label: 'Violations', higher: false },
];

export default function ComparisonTable({ rows, className = '' }: ComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <div className={`card p-4 sm:p-6 ${className}`}>
        <p className="text-charcoal-700 text-center">No comparison data available</p>
      </div>
    );
  }

  const bestValues: Record<string, number> = {};
  METRICS.forEach(m => {
    const values = rows.map(r => {
      const v = r[m.key as keyof ComparisonRow];
      return m.key === 'violations' ? (v as ConstraintViolation[]).length : (v as number);
    });
    bestValues[m.key] = m.higher ? Math.max(...values) : Math.min(...values);
  });

  return (
    <div className={`card p-4 sm:p-6 min-w-0 ${className}`}>
      <h3 className="text-heading-sm font-semibold text-charcoal-900 mb-4">Baseline Comparison</h3>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[460px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="text-left p-2 sm:p-3 font-semibold text-charcoal-800">Method</th>
              {METRICS.map(m => (
                <th key={m.key} scope="col" className="text-right p-2 sm:p-3 font-semibold text-charcoal-800">
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.name} className={`border-b border-border/70 ${rowIndex === 0 ? 'bg-sage-50' : ''}`}>
                <td className={`p-2 sm:p-3 font-medium ${rowIndex === 0 ? 'text-sage-800' : 'text-charcoal-900'}`}>
                  {row.name} {rowIndex === 0 && <span className="ml-1 text-xs bg-sage-700 text-white px-1.5 py-0.5 rounded">Best</span>}
                </td>
                {METRICS.map(m => {
                  const raw = row[m.key as keyof ComparisonRow];
                  const numeric = m.key === 'violations' ? (raw as ConstraintViolation[]).length : (raw as number);
                  const isBest = numeric === bestValues[m.key];
                  const displayValue = m.key === 'violations' ? numeric : numeric.toFixed(1);

                  return (
                    <td key={m.key} className="p-2 sm:p-3 text-right">
                      <span className={`font-mono ${isBest ? 'font-bold text-emerald-800' : 'text-charcoal-700'}`}>
                        {displayValue}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-sm font-semibold text-charcoal-800 mb-2">Violation Details</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {rows.map((row, rowIndex) => (
            <div key={row.name} className="p-3 bg-cream-100 border border-border rounded-lg">
              <p className={`font-medium text-sm ${rowIndex === 0 ? 'text-sage-800' : 'text-charcoal-900'}`}>{row.name}</p>
              {row.violations.length === 0 ? (
                <p className="text-xs text-emerald-800 mt-1">No constraint violations</p>
              ) : (
                <ul className="mt-1 space-y-1 text-xs text-charcoal-700">
                  {row.violations.map((v, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 mt-1.5 rounded-full shrink-0" style={{ backgroundColor: v.severity > 50 ? '#d1421c' : '#b45309' }} aria-hidden="true"></span>
                      <span>{v.description} (severity: {v.severity})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
