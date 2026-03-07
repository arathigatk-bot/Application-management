import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder, className = '', height = '10' }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`input-field flex items-center justify-between gap-2 w-full h-${height} text-sm py-2 px-4 ${value ? 'text-neutral-800' : 'text-neutral-400'}`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50 animate-scaleIn overflow-hidden">
                    <button
                        onClick={() => { onChange(''); setIsOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${!value ? 'text-primary-600 font-medium' : 'text-neutral-600'}`}
                    >
                        {placeholder}
                    </button>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 ${value === opt.value ? 'text-primary-600 font-medium bg-primary-50' : 'text-neutral-600'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
