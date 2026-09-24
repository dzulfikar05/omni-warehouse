import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import TenantSettingsLayout from '@/layouts/settings/tenant-layout';
import { edit as editAppearance } from '@/routes/tenant/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update your account's appearance settings"
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
