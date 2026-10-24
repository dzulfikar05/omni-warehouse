import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import GoogleTranslate from '@/components/google-translate';
// Jika Anda sudah membuat helper rutenya, gunakan ini:
// import { edit as editLanguage } from '@/routes/language';

export default function Language() {
    return (
        <>
            <Head title="Language settings" />

            <h1 className="sr-only">Language settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Language settings"
                    description="Update your account's language preferences"
                />
                
                <div className="p-4 bg-muted/40 rounded-xl border border-border inline-block">
                    <GoogleTranslate />
                </div>
            </div>
        </>
    );
}

Language.layout = {
    breadcrumbs: [
        {
            title: 'Language settings',
            href: '/settings/language', // Atau gunakan editLanguage() jika helper rutenya ada
        },
    ],
};