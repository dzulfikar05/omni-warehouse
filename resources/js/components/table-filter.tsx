import React from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SortOption {
    label: string;
    value: string;
}

interface Props {
    search: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    perPage: string;
    onPerPageChange: (value: string) => void;
    // Props opsional untuk Sorting
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    sortOptions?: SortOption[];
    onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
    children?: React.ReactNode;
}

export function TableFilter({
    search,
    onSearchChange,
    perPage,
    onPerPageChange,
    sortBy = '',
    sortDirection = 'desc',
    sortOptions = [],
    onSortChange,
    children,
}: Props) {
    const handleFieldChange = (value: string) => {
        if (onSortChange) {
            onSortChange(value, sortDirection);
        }
    };

    const toggleDirection = () => {
        if (onSortChange && sortBy) {
            const nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            onSortChange(sortBy, nextDirection);
        }
    };

    return (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Per Page Selector */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select value={perPage} onValueChange={onPerPageChange}>
                    <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
                <span>entries</span>
            </div>

            {/* Controls: Sort Options, Search Input, and Extra Children */}
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
                {/* Sorting Select & Direction Toggle Button */}
                {sortOptions.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <Select value={sortBy} onValueChange={handleFieldChange}>
                            <SelectTrigger className="w-[140px] text-xs">
                                <ArrowUpDown className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={!sortBy}
                            onClick={toggleDirection}
                            className="h-9 w-9 border-border"
                            title={`Order: ${sortDirection.toUpperCase()}`}
                        >
                            {sortDirection === 'asc' ? (
                                <ArrowUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                                <ArrowDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </Button>
                    </div>
                )}

                {/* Input Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={search}
                        onChange={onSearchChange}
                        className="pl-10"
                    />
                </div>

                {children}
            </div>
        </div>
    );
}
