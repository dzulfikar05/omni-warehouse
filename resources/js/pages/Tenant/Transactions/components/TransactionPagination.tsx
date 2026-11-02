import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import type { TransactionFilters } from './TransactionFilterBar';

interface TransactionPaginationProps {
    route: string;
    filters?: Partial<TransactionFilters>;
    currentPage: number;
    lastPage: number;
    total: number;
}

export function TransactionPagination({
    route,
    filters = {},
    currentPage,
    lastPage,
    total,
}: TransactionPaginationProps) {
    const { t } = useTranslation();

    const visitPage = (page: number) => {
        router.get(
            route,
            Object.fromEntries(
                Object.entries({ ...filters, page }).filter(
                    ([, value]) => value !== null && value !== '',
                ),
            ),
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <span>
                {t('pagination_page')} {currentPage} {t('pagination_of')}{' '}
                {lastPage} · {total} {t('pagination_transactions')}
            </span>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => visitPage(currentPage - 1)}
                    className="border-border"
                >
                    {t('pagination_previous')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= lastPage}
                    onClick={() => visitPage(currentPage + 1)}
                    className="border-border"
                >
                    {t('pagination_next')}
                </Button>
            </div>
        </div>
    );
}
