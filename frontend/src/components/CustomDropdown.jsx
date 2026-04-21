import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function CustomDropdown({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder = "Select...",
    className = "" 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef(null);

    const activeItem = options.find(opt => opt.value === value);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset search when opening/closing
    useEffect(() => {
        if (!isOpen) setSearch('');
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-white/60 hover:bg-white/90 rounded-2xl px-4 py-2.5 border border-slate-200/60 cursor-pointer transition-all duration-300 shadow-sm group select-none"
            >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</span>
                <span className="text-sm font-bold text-slate-800 truncate leading-none min-w-[100px]">
                    {activeItem ? activeItem.label : placeholder}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[220px] glass-card rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 border-white/60 bg-white/90">
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-xl mb-2 border border-slate-100 shadow-inner">
                        <Search size={14} className="text-slate-400" />
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder-slate-400 w-full"
                        />
                    </div>

                    <div className="max-h-[240px] overflow-auto custom-scrollbar space-y-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest italic">
                                No matches found
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <div 
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                        value === opt.value 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                            : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                                    }`}
                                >
                                    <span className="text-xs font-bold">{opt.label}</span>
                                    {value === opt.value && <Check size={14} strokeWidth={3} />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
