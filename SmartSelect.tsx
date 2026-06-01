import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Search, Edit2 } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
}

interface SmartSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  onCreateNew?: (typedValue: string) => void;
  onEditExisting?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function SmartSelect({
  value, onChange, options, placeholder = 'Search or select...', label,
  onCreateNew, onEditExisting, required, disabled
}: SmartSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase()) ||
    (o.sublabel && o.sublabel.toLowerCase().includes(search.toLowerCase()))
  );

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`flex items-center justify-between px-3 py-2.5 border rounded-xl cursor-pointer transition-all
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-indigo-400'}
          ${open ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'}
          ${!selected ? 'text-gray-400' : 'text-gray-800'}`}
      >
        <span className="text-sm truncate">
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.label}</span>
              {selected.badge && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">{selected.badge}</span>
              )}
            </span>
          ) : placeholder}
        </span>
        <div className="flex items-center gap-1">
          {selected && onEditExisting && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEditExisting(value); }}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
            >
              <Edit2 size={12} />
            </button>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
              <Search size={14} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-center">
                <p className="text-sm text-gray-500 mb-2">No results found</p>
                {onCreateNew && (
                  <button
                    type="button"
                    onClick={() => { onCreateNew(search); setOpen(false); setSearch(''); }}
                    className="flex items-center gap-2 mx-auto text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus size={14} /> Create "{search}"
                  </button>
                )}
              </div>
            ) : (
              <>
                {filtered.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setOpen(false); setSearch(''); }}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors
                      ${value === opt.value ? 'bg-indigo-50' : ''}`}
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                      {opt.sublabel && <div className="text-xs text-gray-500">{opt.sublabel}</div>}
                    </div>
                    {opt.badge && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{opt.badge}</span>
                    )}
                  </div>
                ))}
                {onCreateNew && (
                  <div
                    onClick={() => { onCreateNew(search); setOpen(false); setSearch(''); }}
                    className="flex items-center gap-2 px-3 py-2.5 border-t border-gray-100 cursor-pointer hover:bg-green-50 text-green-600 font-medium text-sm"
                  >
                    <Plus size={14} /> {search ? `Create "${search}"` : 'Create New'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
