'use client';

interface CategoryData {
  name: string;
  score: number;
}

function getColor(score: number) {
  if (score >= 70) return '#1D9E75';
  if (score >= 40) return '#EF9F27';
  return '#E24B4A';
}

function getLabel(score: number) {
  if (score >= 70) return 'Strong';
  if (score >= 40) return 'Good';
  return 'Needs work';
}

export function CategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-3">
          <div className="w-24 shrink-0 text-xs font-medium truncate">{item.name}</div>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${item.score}%`, backgroundColor: getColor(item.score) }}
            />
          </div>
          <div className="w-8 text-right text-xs font-semibold" style={{ color: getColor(item.score) }}>
            {item.score}
          </div>
          <div className="w-20 text-xs text-muted-foreground">{getLabel(item.score)}</div>
        </div>
      ))}
    </div>
  );
}
