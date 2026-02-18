import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface InputRupiahProps {
    id?: string;
    value: number;
    onChange: (value: number) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

function formatDisplay(value: number): string {
    if (!value) return '';
    return new Intl.NumberFormat('id-ID').format(value);
}

export function InputRupiah({ id, value, onChange, className, placeholder = '0', disabled }: InputRupiahProps) {
    const [display, setDisplay] = useState(formatDisplay(value));
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync from outside (e.g. form reset)
    useEffect(() => {
        setDisplay(formatDisplay(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Strip anything that's not a digit
        const raw = e.target.value.replace(/\D/g, '');
        const num = raw ? parseInt(raw, 10) : 0;
        setDisplay(raw ? new Intl.NumberFormat('id-ID').format(num) : '');
        onChange(num);
    };

    return (
        <div className={cn('relative flex items-center', className)}>
            <span className="pointer-events-none absolute left-3 select-none text-sm font-medium text-muted-foreground">
                Rp
            </span>
            <input
                ref={inputRef}
                id={id}
                type="text"
                inputMode="numeric"
                value={display}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
    );
}
