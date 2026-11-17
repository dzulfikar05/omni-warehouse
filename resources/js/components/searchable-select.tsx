import { Check, ChevronsUpDown, Search } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string;
    label: string;
    sublabel?: string;
    badge?: string;
}

interface SearchableSelectProps {
    options: SelectOption[];
    value: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options = [],
    value,
    onSelect,
    placeholder = 'Pilih...',
    searchPlaceholder = 'Cari...',
    disabled = false,
    className,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const safeOptions = Array.isArray(options) ? options : [];
    const selectedOption = safeOptions.find(
        (opt) => opt && String(opt.value ?? '') === String(value ?? ''),
    );

    const filteredOptions = safeOptions.filter((opt) => {
        if (!opt) {
            return false;
        }

        const labelText = String(opt.label ?? '').toLowerCase();
        const sublabelText = String(opt.sublabel ?? '').toLowerCase();
        const searchTerm = search.toLowerCase().trim();

        return (
            labelText.includes(searchTerm) || sublabelText.includes(searchTerm)
        );
    });

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        'h-9 w-full justify-between rounded-xl border-input bg-background px-3 text-xs font-normal',
                        !value && 'text-muted-foreground',
                        className,
                    )}
                >
                    <span className="truncate font-medium">
                        {selectedOption
                            ? String(selectedOption.label ?? '')
                            : placeholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[280px] rounded-xl border border-border bg-popover p-2 font-sans text-popover-foreground shadow-xl"
                align="start"
            >
                <div className="mb-1.5 flex items-center border-b border-border px-2 pb-2">
                    <Search className="mr-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-7 border-0 bg-transparent text-xs focus-visible:ring-0"
                    />
                </div>
                <div className="max-h-56 space-y-1 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onSelect(opt.value);
                                    setOpen(false);
                                    setSearch('');
                                }}
                                className={cn(
                                    'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground',
                                    value === opt.value &&
                                        'bg-accent font-semibold',
                                )}
                            >
                                <div className="min-w-0 flex-1">
                                    {/* Menyoroti Kode Rak secara Jelas (Font Mono Bold) */}
                                    <div className="truncate font-mono text-xs font-bold text-foreground">
                                        {String(opt.label ?? '')}
                                    </div>
                                    {opt.sublabel && (
                                        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                                            {String(opt.sublabel ?? '')}
                                        </div>
                                    )}
                                </div>
                                {opt.badge && (
                                    <span className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                                        {String(opt.badge ?? '')}
                                    </span>
                                )}
                                {value === opt.value && (
                                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="py-4 text-center text-xs text-muted-foreground">
                            Data tidak ditemukan.
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
