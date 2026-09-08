import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from './pagination';
import { ReactNode } from 'react';

interface Props<T> {
    headers: string[];
    data: T[];
    renderRow: (item: T) => ReactNode;
    pagination: {
        links: Array<{ url: string | null; label: string; active: boolean }>;
        from?: number;
        to?: number;
        total?: number;
    };
}

export function DataTable<T>({ headers, data, renderRow, pagination }: Props<T>) {
    return (
        <div className="space-y-4">
            {/* Ubah border-slate-100 dan bg-white menjadi border-border, bg-card, dan text-card-foreground */}
            <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
                <Table>
                    {/* Ubah bg-slate-50/50 menjadi bg-muted/50 */}
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            {headers.map((header, i) => (
                                <TableHead key={i} className={i === headers.length - 1 ? "text-right" : ""}>
                                    {header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, i) => (
                                /* Ubah hover:bg-slate-50/50 menjadi hover:bg-muted/50 */
                                <TableRow key={i} className="transition-colors hover:bg-muted/50">
                                    {renderRow(item)}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {/* Ubah text-slate-500 menjadi text-muted-foreground */}
                                <TableCell colSpan={headers.length} className="h-24 text-center text-muted-foreground italic">
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
