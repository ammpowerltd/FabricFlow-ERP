import { useState, useRef, useEffect } from 'react';
import { Search, Plus, Package, Users, Truck, Tag, Box, MapPin } from 'lucide-react';

interface SmartDropdownProps {
  label: string;
  items: any[];
  value: string;
  onChange: (value: string, item?: any) => void;
  placeholder?: string;
  type: 'item' | 'party' | 'contractor' | 'courier' | 'warehouse' | 'category' | 'unit';
  showStock?: boolean;
  onCreateNew?: () => void;
}

const typeIcons: Record<string, any> = {
  item: Package,
  party: Users,
  contractor: Users,
  courier: Truck,
  warehouse: Box,
  category: Tag,
  unit: MapPin,
};

export default function SmartDropdown({ label, items, value, onChange, placeholder = 'Search...', type, showStock = false, onCreateNew }: SmartDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    if (type === 'item') {
      return item.name.toLowerCase().includes(searchLower) || item.sku.toLowerCase().includes(searchLower) || item.itemCode.toLowerCase().includes(searchLower);
    } else if (type === 'party' || type === 'contractor' || type === 'courier') {
      return item.companyName.toLowerCase().includes(searchLower) || item.partyCode.toLowerCase().includes(searchLower);
    } else if (type === 'warehouse') {
      return item.name.toLowerCase().includes(searchLower) || item.code.toLowerCase().includes(searchLower);
    } else {
      return item.name?.toLowerCase().includes(searchLower) || item.code?.toLowerCase().includes(searchLower);
    }
  });

  const selectedItem = items.find((item) => {
    if (type === 'item') return item.id === value || item.sku === value;
    return item.id === value;
  });

  const Icon = typeIcons[type] || Package;

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-white flex items-center justify-between hover:border-indigo-300 transition-colors"
      >
        <span className={selectedItem ? 'text-gray-800' : 'text-gray-400'}>
          {selectedItem 
            ? (type === 'item' ? `${selectedItem.name} (${selectedItem.sku})` : selectedItem.companyName || selectedItem.name)
            : placeholder
          }
        </span>
        <Icon className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                autoFocus
              />
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-48">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.id, item);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-50 last:border-0 ${
                    selectedItem?.id === item.id ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {type === 'item' ? item.name : item.companyName || item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {type === 'item' ? `SKU: ${item.sku} • ${item.itemCode}` : item.partyCode || item.code}
                      </p>
                    </div>
                    {showStock && type === 'item' && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Avail: <span className="font-medium text-gray-800">{item.availableStock}</span></p>
                        {item.reservedStock > 0 && (
                          <p className="text-xs text-amber-600">Reserved: {item.reservedStock}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-500 mb-2">No {label.toLowerCase()} found</p>
                {onCreateNew && (
                  <button
                    onClick={() => {
                      onCreateNew();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Add New {label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
