import React from 'react';
import { CategoryType } from '../types';

interface CategoryChipsProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
}

const CATEGORIES: CategoryType[] = [
  'All',
  'Jazz',
  'Quiz Night',
  'Open Mic',
  'Nightlife',
  'Meetups',
  'Seminars',
  'Food',
  'Arts',
  'Sports',
];

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="sticky top-[57px] z-30 w-full bg-[#0d0d12]/95 backdrop-blur-md py-2.5 mb-5 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF2D55] to-[#FF5E3A] text-white shadow-lg shadow-[#FF2D55]/30 scale-105'
                  : 'bg-[#1f1f2e] text-white/70 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
