import { router } from '@inertiajs/react';
import { debounce } from 'lodash';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/context/language-context';

export interface TransactionFilters {
    search: string;
    date_from: string;
    date_to: string;
    status: string;
    supplier_id: string;
    customer_id: string;
    from_warehouse_id: string;
    to_warehouse_id: string;
}

interface FilterOption {
    id: number;
    name: string;
}

interface TransactionFilterBarProps {
    route: string;
    kind: 'inbound' | 'outbound' | 'stock-transfer';
    filters?: Partial<TransactionFilters>;
    statuses: string[];
    suppliers?: FilterOption[];
    customers?: FilterOption[];
    warehouses?: FilterOption[];
}

const emptyFilters: TransactionFilters = {
    search: '',
    date_from: '',
    date_to: '',
    status: '',
    supplier_id: '',
    customer_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
};

function queryParams(filters: TransactionFilters) {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== ''),
    );
}

const statusTranslationKeys: Record<string, string> = {
    DRAFT: 'status_draft',
    VERIFIED: 'status_verified',
    COMMITTED: 'status_committed',
    ON_HOLD: 'status_on_hold',
    HOLD: 'status_on_hold',
    PENDING: 'status_pending',
    COMPLETED: 'status_completed',
    SUCCESS: 'status_completed',
    RECEIVING: 'status_receiving',
    CLOSED: 'status_closed',
    READY_TO_PICK: 'status_ready_to_pick',
    PICKING: 'status_picking',
    PACKING: 'status_packing',
    DISPATCHED: 'status_dispatched',
    IN_TRANSIT: 'status_in_transit',
};

export function transactionStatusLabel(
    status: string,
    t: (key: string) => string,
) {
    return t(statusTranslationKeys[status.toUpperCase()] ?? status);
}

export function TransactionFilterBar({
    route,
    kind,
    filters = {},
    statuses,
    suppliers = [],
    customers = [],
    warehouses = [],
}: TransactionFilterBarProps) {
    const { t } = useTranslation();
    const [values, setValues] = useState<TransactionFilters>({
        ...emptyFilters,
        ...filters,
    });
    const debouncedSearch = useMemo(
        () =>
            debounce((nextValues: TransactionFilters) => {
                router.get(route, queryParams(nextValues), {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true,
                });
            }, 500),
        [route],
    );

    useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

    const updateValue = (key: keyof TransactionFilters, value: string) => {
        debouncedSearch.cancel();
        setValues((currentValues) => ({ ...currentValues, [key]: value }));
    };

    const applyFilters = () => {
        debouncedSearch.cancel();
        router.get(route, queryParams(values), {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        debouncedSearch.cancel();
        setValues(emptyFilters);
        router.get(
            route,
            {},
            {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            },
        );
    };

    const renderSelect = (
        key: keyof TransactionFilters,
        label: string,
        placeholder: string,
        options: FilterOption[],
    ) => (
        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            <span>{t(label)}</span>
            <Select
                value={values[key] || 'all'}
                onValueChange={(value) =>
                    updateValue(key, value === 'all' ? '' : value)
                }
            >
                <SelectTrigger className="h-9 w-full bg-background text-foreground">
                    <SelectValue placeholder={t(placeholder)} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t(placeholder)}</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                            {option.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </label>
    );

    return (
        <form
            className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5"
            onSubmit={(event) => {
                event.preventDefault();
                applyFilters();
            }}
        >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="size-4 text-primary" />
                <span>{t('advanced_filters')}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground sm:col-span-2">
                    <span>{t('search_transaction')}</span>
                    <span className="relative">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={values.search}
                            onChange={(event) => {
                                const search = event.target.value;
                                const nextValues = { ...values, search };
                                setValues(nextValues);
                                debouncedSearch(nextValues);
                            }}
                            placeholder={t('search_placeholder_transaction')}
                            className="h-9 bg-background pl-9 text-foreground"
                        />
                    </span>
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    <span>{t('filter_date_from')}</span>
                    <Input
                        type="date"
                        value={values.date_from}
                        max={values.date_to || undefined}
                        onChange={(event) =>
                            updateValue('date_from', event.target.value)
                        }
                        className="h-9 bg-background text-foreground"
                    />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    <span>{t('filter_date_to')}</span>
                    <Input
                        type="date"
                        value={values.date_to}
                        min={values.date_from || undefined}
                        onChange={(event) =>
                            updateValue('date_to', event.target.value)
                        }
                        className="h-9 bg-background text-foreground"
                    />
                </label>
                <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
                    <span>{t('filter_status')}</span>
                    <Select
                        value={values.status || 'all'}
                        onValueChange={(value) =>
                            updateValue('status', value === 'all' ? '' : value)
                        }
                    >
                        <SelectTrigger className="h-9 w-full bg-background text-foreground">
                            <SelectValue
                                placeholder={t('option_all_statuses')}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                {t('option_all_statuses')}
                            </SelectItem>
                            {statuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {transactionStatusLabel(status, t)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>
                {kind === 'inbound' &&
                    renderSelect(
                        'supplier_id',
                        'filter_supplier',
                        'option_all_suppliers',
                        suppliers,
                    )}
                {kind === 'outbound' &&
                    renderSelect(
                        'customer_id',
                        'filter_customer',
                        'option_all_customers',
                        customers,
                    )}
                {kind === 'stock-transfer' && (
                    <>
                        {renderSelect(
                            'from_warehouse_id',
                            'filter_warehouse_origin',
                            'option_all_warehouses',
                            warehouses,
                        )}
                        {renderSelect(
                            'to_warehouse_id',
                            'filter_warehouse_destination',
                            'option_all_warehouses',
                            warehouses,
                        )}
                    </>
                )}
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={resetFilters}
                    className="h-9 gap-2 border-border"
                >
                    <RotateCcw className="size-4" />
                    {t('btn_reset_filter')}
                </Button>
                <Button
                    type="submit"
                    className="h-9 gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                    <Filter className="size-4" />
                    {t('btn_apply_filter')}
                </Button>
            </div>
        </form>
    );
}
