'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface FilterOption {
  value: string;
  labelKey: string;
}

interface CategoryFilterProps {
  options: readonly FilterOption[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export default function CategoryFilter({ options, selected, onSelect }: CategoryFilterProps) {
  var { t } = useLanguage();

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
        {t('filter.all')}
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
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}
