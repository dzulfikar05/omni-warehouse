import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterDropdownProps {
    children: React.ReactNode;
    onApply: () => void;
    onReset: () => void;
}

export function FilterDropdown({ children, onApply, onReset }: FilterDropdownProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 border-dashed">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Filter</span>
                </Button>
            </PopoverTrigger>
            {/* Lebar diperluas ke w-88 / w-96 agar Date Range & Select tidak terpotong */}
            <PopoverContent className="w-88 p-4 shadow-md sm:w-96" align="end">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Filter Options
                        </h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onReset}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Reset
                        </Button>
                    </div>

                    {/* Form Controls / Inputs */}
                    <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                        {children}
                    </div>

                    {/* Tombol Aksi - Apply Filter Berwarna Biru Utama */}
                    <div className="pt-2 border-t flex justify-end gap-2">
                        <Button
                            size="sm"
                            onClick={onApply}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-8 text-xs shadow-sm"
                        >
                            Apply Filter
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
