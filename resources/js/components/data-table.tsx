import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from './pagination';
import { ReactNode } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

export interface HeaderConfig {
    label: string;
    sortField?: string; // Field database untuk sorting (contoh: 'name', 'created_at', 'id')
    className?: string;
}

interface Props<T> {
    headers: Array<string | HeaderConfig>;
    data: T[];
    renderRow: (item: T) => ReactNode;
    pagination: {
        links: Array<{ url: string | null; label: string; active: boolean }>;
        from?: number;
        to?: number;
        total?: number;
    };
    // Props untuk mengontrol state sorting
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
}

export function DataTable<T>({
    headers,
    data,
    renderRow,
    pagination,
    sortBy = '',
    sortDirection = 'desc',
    onSortChange,
}: Props<T>) {
    // Fungsi handler otomatis saat header diklik
    const handleHeaderClick = (sortField?: string) => {
        if (!sortField || !onSortChange) return;

        // Jika kolom yang diklik sama dengan kolom aktif saat ini, balik arahnya (asc <-> desc)
        if (sortBy === sortField) {
            const nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            onSortChange(sortField, nextDirection);
        } else {
            // Jika memilih kolom baru, default ke 'asc'
            onSortChange(sortField, 'asc');
        }
    };

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            {headers.map((header, i) => {
                                const isObject = typeof header === 'object';
                                const label = isObject ? header.label : header;
                                const sortField = isObject ? header.sortField : undefined;
                                const customClass = isObject ? header.className : '';

                                const isSorted = Boolean(sortField && sortBy === sortField);
                                const isRightAligned = i === headers.length - 1 && !customClass;

                                return (
                                    <TableHead
                                        key={i}
                                        className={`${isRightAligned ? 'text-right' : ''} ${
                                            sortField ? 'cursor-pointer select-none transition-colors hover:bg-muted/80' : ''
                                        } ${customClass || ''}`}
                                        onClick={() => handleHeaderClick(sortField)}
                                    >
                                        <div
                                            className={`inline-flex items-center gap-1.5 ${
                                                isRightAligned ? 'justify-end w-full' : ''
                                            }`}
                                        >
                                            <span className="font-semibold text-xs text-foreground">{label}</span>
                                            {sortField && (
                                                <span className="shrink-0 text-muted-foreground">
                                                    {isSorted ? (
                                                        sortDirection === 'asc' ? (
                                                            <ArrowUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        ) : (
                                                            <ArrowDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-30 hover:opacity-100" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, i) => (
                                <TableRow key={i} className="transition-colors hover:bg-muted/50">
                                    {renderRow(item)}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={headers.length}
                                    className="h-24 text-center text-muted-foreground italic"
                                >
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <Pagination {...pagination} />
        </div>
    );
}
