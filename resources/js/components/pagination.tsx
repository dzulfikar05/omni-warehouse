import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
    links: Array<{ url: string | null; label: string; active: boolean }>;
    from?: number;
    to?: number;
    total?: number;
}

export function Pagination({ links, from, to, total }: Props) {
    return (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{from ?? 0}</span> to <span className="font-semibold text-foreground">{to ?? 0}</span> of <span className="font-semibold text-foreground">{total ?? 0}</span> entries
            </div>
            <div className="flex flex-wrap items-center gap-1">
                {links.map((link, index) => {
                    const isPrev = link.label.includes('Previous');
                    const isNext = link.label.includes('Next');

                    return (
                        <Button
                            key={index}
                            variant={link.active ? 'default' : 'outline'}
                            size={isPrev || isNext ? 'default' : 'icon'}
                            className={`h-8 text-xs transition-all ${
                                link.active
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs shadow-blue-600/30'
                                    : 'border-border/80 text-muted-foreground hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400'
                            } ${!link.url ? 'cursor-not-allowed opacity-40 hover:bg-transparent hover:text-muted-foreground hover:border-border/80' : ''}`}
                            asChild={!!link.url}
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link href={link.url} preserveScroll>
                                    {isPrev && <ChevronLeft className="mr-1 h-3.5 w-3.5" />}
                                    {isPrev ? 'Prev' : isNext ? 'Next' : link.label}
                                    {isNext && <ChevronRight className="ml-1 h-3.5 w-3.5" />}
                                </Link>
                            ) : (
                                <span>{isPrev ? 'Prev' : isNext ? 'Next' : link.label}</span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
