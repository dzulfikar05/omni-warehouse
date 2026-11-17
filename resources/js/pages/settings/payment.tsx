
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { useTranslation } from '@/context/language-context';

interface SettingsProps {
    settings: {
        sparkpay_server_key: string;
        sparkpay_client_key: string;
        sparkpay_mode: string;
    };
    status?: string;
}

export default function Payment({ settings, status }: SettingsProps) {
    const { t } = useTranslation();

    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        sparkpay_server_key: settings.sparkpay_server_key || '',
        sparkpay_client_key: settings.sparkpay_client_key || '',
        sparkpay_mode: settings.sparkpay_mode || 'sandbox',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put('/settings/payment', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('Payment settings')} />
            <h1 className="sr-only">{t('Payment settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Payment information')}
                    description={t('Manage your payment gateway configuration and API credentials.')}
                />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="sparkpay_mode">{t('Environment Mode')}</Label>
                        <Select
                            value={data.sparkpay_mode}
                            onValueChange={(value) => setData('sparkpay_mode', value)}
                        >
                            <SelectTrigger id="sparkpay_mode" className="w-full">
                                <SelectValue placeholder={t('Select mode')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                                <SelectItem value="production">Production (Live)</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.sparkpay_mode} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sparkpay_server_key">{t('Server Key (Secret)')}</Label>
                        <Input
                            id="sparkpay_server_key"
                            type="password"
                            value={data.sparkpay_server_key}
                            onChange={(e) => setData('sparkpay_server_key', e.target.value)}
                            placeholder="sk_test_..."
                            autoComplete="new-password"
                        />
                        <p className="text-sm text-muted-foreground">
                            {t('Used on the backend to create payment requests and payment links.')}
                        </p>
                        <InputError message={errors.sparkpay_server_key} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sparkpay_client_key">{t('Client Key (Public)')}</Label>
                        <Input
                            id="sparkpay_client_key"
                            type="text"
                            value={data.sparkpay_client_key}
                            onChange={(e) => setData('sparkpay_client_key', e.target.value)}
                            placeholder="Client key for Snap.js..."
                            autoComplete="off"
                        />
                        <p className="text-sm text-muted-foreground">
                            {t('Used on the frontend browser by the Snap.js library.')}
                        </p>
                        <InputError message={errors.sparkpay_client_key} />
                    </div>

                    <div className="rounded-md border border-border p-4">
                        <p className="text-sm font-medium">{t('Security Information')}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {t('Keep your Server Key confidential. Never expose your secret API credentials in frontend code or public repositories.')}
                        </p>
                    </div>

                    {status === 'success' && (
                        <p className="text-sm font-medium text-green-600">
                            {t('Payment gateway settings updated successfully.')}
                        </p>
                    )}

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? t('Saving...') : t('Save')}
                        </Button>
                        {recentlySuccessful && (
                            <p className="text-sm text-muted-foreground">{t('Saved.')}</p>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}

Payment.layout = {
    breadcrumbs: [
        {
            title: 'Payment settings',
            href: '/settings/payment',
        },
    ],
};
