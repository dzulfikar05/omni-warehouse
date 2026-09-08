import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Props {
    search: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    perPage: string;
    onPerPageChange: (value: string) => void;
    children?: React.ReactNode;
}

export function TableFilter({
    search,
    onSearchChange,
    perPage,
    onPerPageChange,
    children,
}: Props) {
    return (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Ubah text-slate-600 menjadi text-muted-foreground */}
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

            <div className="flex flex-1 items-center justify-end gap-2">
                <div className="relative w-full sm:w-64">
                    {/* Ubah text-slate-400 menjadi text-muted-foreground */}
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
