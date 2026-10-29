import React from 'react';
import { Globe, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/language-context';
import { cn } from '@/lib/utils';

export function LanguageDropdown() {
    const { locale, setLocale, t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 rounded-xl border border-border"
                    aria-label={t('Change language')}
                >
                    <Globe size={16} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground uppercase">
                        {locale}
                    </span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48 p-2 space-y-1">
                <div className="text-xs font-semibold px-2 py-1.5 border-b border-border flex justify-between items-center">
                    <span>{t('Choose language')}</span>
                </div>

                <DropdownMenuItem
                    className={cn(
                        'p-2 text-xs rounded-lg cursor-pointer flex items-center justify-between gap-2 border border-transparent transition-colors',
                        locale === 'id' ? 'bg-muted border-border/50 font-medium' : 'hover:bg-muted'
                    )}
                    onClick={() => setLocale('id')}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🇮🇩</span>
                        <span>{t('Bahasa Indonesia')}</span>
                    </div>
                    {locale === 'id' && <Check size={14} className="text-primary shrink-0" />}
                </DropdownMenuItem>

                <DropdownMenuItem
                    className={cn(
                        'p-2 text-xs rounded-lg cursor-pointer flex items-center justify-between gap-2 border border-transparent transition-colors',
                        locale === 'en' ? 'bg-muted border-border/50 font-medium' : 'hover:bg-muted'
                    )}
                    onClick={() => setLocale('en')}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm">🇬🇧</span>
                        <span>{t('English')}</span>
                    </div>
                    {locale === 'en' && <Check size={14} className="text-primary shrink-0" />}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
