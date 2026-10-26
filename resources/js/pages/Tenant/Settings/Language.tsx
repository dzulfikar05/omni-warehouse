import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-context';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';

export default function Language() {
    const { locale, setLocale, t } = useTranslation();

    return (
        <>
            <Head title={t('Pengaturan bahasa')} />

            <h1 className="sr-only">{t('Pengaturan bahasa')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Pengaturan bahasa')}
                    description={t('Ubah preferensi bahasa akun Anda')}
                />

                <div className="inline-block space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                    <p className="text-sm font-medium">{t('Bahasa pilihan')}</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant={locale === 'id' ? 'default' : 'outline'}
                            aria-pressed={locale === 'id'}
                            onClick={() => setLocale('id')}
                        >
                            {t('Bahasa Indonesia')}
                        </Button>
                        <Button
                            type="button"
                            variant={locale === 'en' ? 'default' : 'outline'}
                            aria-pressed={locale === 'en'}
                            onClick={() => setLocale('en')}
                        >
                            {t('Inggris')}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {t('Preferensi bahasa Anda disimpan di perangkat ini.')}
                    </p>
                </div>
            </div>
        </>
    );
}

Language.layout = (page: React.ReactNode) => (
    <TenantSettingsLayout>
        {page}
    </TenantSettingsLayout>
);
