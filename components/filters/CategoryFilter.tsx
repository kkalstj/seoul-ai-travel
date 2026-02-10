'use client';

interface FilterOption {
  value: string;
  label: string;
}

interface CategoryFilterProps {
  options: readonly FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export default function CategoryFilter({ options, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        전체
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(selected === option.value ? null : option.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}