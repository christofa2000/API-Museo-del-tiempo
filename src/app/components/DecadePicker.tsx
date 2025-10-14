"use client";

type Props = { value: number; onChange: (v: number) => void };
const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010];

export default function DecadePicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {DECADES.map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          className={`rounded-full px-4 py-2 text-sm transition
            ${
              value === d
                ? "bg-cosmic-500 text-white"
                : "bg-white/10 hover:bg-white/20"
            }`}
        >
          {d}s
        </button>
      ))}
    </div>
  );
}
