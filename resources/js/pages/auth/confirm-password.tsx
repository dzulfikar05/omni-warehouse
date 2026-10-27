import { Form, Head, router } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/context/language-context';
import { store } from '@/routes/password/confirm';
import { ArrowLeft, ArrowRight, Lock, ShieldAlert } from 'lucide-react';

export default function ConfirmPassword() {
    const { t } = useTranslation();

    // Handler untuk kembali ke URL sebelumnya secara dinamis
    const handleBack = () => {
        // Jika terdapat riwayat navigasi di browser, kembali ke halaman sebelumnya
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback aman jika halaman dibuka secara langsung di tab baru
            router.visit('/dashboard');
        }
    };

    return (
        <>
            <Head title={t("Confirm Password")} />

            {/* Container Outer dengan Adaptasi Light/Dark Mode */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans overflow-hidden transition-colors duration-300 dark:bg-slate-950">

                {/* Dynamic Back Button di Pojok Kiri Atas */}
                <button
                    type="button"
                    onClick={handleBack}
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900 hover:shadow-md active:scale-95 cursor-pointer dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    {t("Back")}
                </button>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-900/20" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 blur-3xl dark:bg-indigo-900/20" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/60 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">

                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Title Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {t("Confirm Your Password")}
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            {t("This is a secure area of the application. Please confirm your password before continuing.")}
                        </p>
                    </div>

                    {/* Security Notice Box */}
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-xs text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <span>{t("Security Verification Required: Enter your current account password to proceed.")}</span>
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    {/* Password Field */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            {t("Password")}
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoFocus
                                            autoComplete="current-password"
                                            placeholder={t("••••••••••••••••")}
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-sm transition-all focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder-slate-500 dark:focus:bg-slate-950 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500 dark:shadow-blue-950/50"
                                        disabled={processing}
                                        data-test="confirm-password-button"
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                {t("Confirm Password")}
                                                <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

ConfirmPassword.layout = (page: React.ReactNode) => page;
