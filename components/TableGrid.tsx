type Props<T extends string> = {
  items: readonly T[];
  columns: number;
  isActive: (v: T) => boolean;
  onToggle: (v: T) => void;
};

export default function TableGrid<T extends string>({
  items,
  columns,
  isActive,
  onToggle,
}: Props<T>) {
  const rows = Math.max(1, Math.ceil(items.length / columns));

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-black bg-white">
      {Array.from({ length: rows }, (_, rowIdx) => {
        const slice = items.slice(rowIdx * columns, rowIdx * columns + columns);
        return (
          <div key={rowIdx} className="flex border-b border-black last:border-b-0">
            {Array.from({ length: columns }, (_, colIdx) => {
              const v = slice[colIdx];
              const lastCol = colIdx === columns - 1;
              if (!v) {
                return (
                  <div
                    key={`empty-${rowIdx}-${colIdx}`}
                    className={`flex-1 bg-white py-3 ${lastCol ? "" : "border-r border-black"}`}
                  />
                );
              }
              const active = isActive(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onToggle(v)}
                  className={`flex-1 truncate px-1 py-3 text-center text-[13px] font-black ${
                    lastCol ? "" : "border-r border-black"
                  } ${active ? "bg-[#4A6CF7] text-white" : "bg-white text-black"}`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
