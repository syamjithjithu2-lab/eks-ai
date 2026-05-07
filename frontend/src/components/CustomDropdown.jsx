import { useState, useRef, useEffect, memo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

const CustomDropdown = memo(function CustomDropdown({ 
    label, 
    options, 
    value, 
    onChange, 
    placeholder = "Select...",
    className = "",
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

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

    useEffect(() => {
        if (!isOpen) setSearch('');
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => 
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                    handleSelect(filteredOptions[focusedIndex].value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    const handleSelect = (selectedValue) => {
        onChange(selectedValue);
        setIsOpen(false);
        setFocusedIndex(-1);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`flex items-center gap-2 md:gap-3 bg-white/60 hover:bg-white/90 rounded-xl md:rounded-2xl px-3 md:px-4 py-2 md:py-2.5 border border-slate-200/60 cursor-pointer transition-all duration-300 shadow-sm group select-none ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${isOpen ? 'ring-2 ring-indigo-500 ring-offset-2' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1'}`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={`${label} dropdown`}
            >
                <span className="text-[0.5625rem] md:text-[0.625rem] font-black text-slate-500 uppercase tracking-widest leading-none hidden sm:inline">
                    {label}
                </span>
                <span className="text-xs md:text-sm font-bold text-slate-800 truncate leading-none min-w-[5rem] md:min-w-[6.25rem]">
                    {activeItem ? activeItem.label : placeholder}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-[99]"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close dropdown"
                    />
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[13.75rem] glass-card rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 border-white/60 bg-white/90" role="listbox">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 rounded-xl mb-2 border border-slate-100 shadow-inner">
                            <Search size={14} className="text-slate-400 flex-shrink-0" />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setFocusedIndex(0);
                                }}
                                onKeyDown={handleKeyDown}
                                className="bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder-slate-400 w-full"
                                aria-label="Search options"
                            />
                        </div>

                        <div className="max-h-[15rem] overflow-auto custom-scrollbar space-y-1" role="presentation">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-[0.625rem] font-bold text-slate-400 uppercase text-center tracking-widest italic">
                                    No matches found
                                </div>
                            ) : (
                                filteredOptions.map((opt, idx) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        role="option"
                                        aria-selected={value === opt.value}
                                        onMouseEnter={() => setFocusedIndex(idx)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                                            value === opt.value 
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                                : focusedIndex === idx
                                                ? 'bg-indigo-50 text-indigo-600'
                                                : 'hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold truncate">{opt.label}</span>
                                        {value === opt.value && (
                                            <Check size={14} className="ml-auto flex-shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
});

export default CustomDropdown;
