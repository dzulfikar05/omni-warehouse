import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    onApply: () => void;
    onReset?: () => void;
}

export function FilterDropdown({ children, onApply, onReset }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 ">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Filter Options</h4>
                    <div className="grid gap-4 py-2">
                        {children}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t">
                        <Button variant="ghost" size="sm" onClick={onReset} className="text-xs">
                            Reset
                        </Button>
                        <Button size="sm" onClick={onApply} className="text-xs">
                            Apply Filter
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
