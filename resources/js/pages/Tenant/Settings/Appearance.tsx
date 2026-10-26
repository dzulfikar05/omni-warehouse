import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useTranslation } from '@/context/language-context';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';
import { edit as editAppearance } from '@/routes/tenant/appearance';

export default function Appearance() {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t("Appearance settings")} />

            <h1 className="sr-only">{t("Appearance settings")}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t("Appearance settings")}
                    description={t("Update your account's appearance settings")}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = (page: React.ReactNode) => (
    <TenantSettingsLayout>
        {page}
    </TenantSettingsLayout>
);
