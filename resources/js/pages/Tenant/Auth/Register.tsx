import { Form, Head, Link } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, ArrowRight, Building, CreditCard, Lock, Mail, User } from 'lucide-react';

interface Plan {
    id: number;
    name: string;
    price: number | string;
}

interface Props {
    plans: Plan[];
    selectedPlanId?: string;
}

export default function TenantRegister({ plans = [], selectedPlanId }: Props) {
    return (
        <>
            <Head title="Register Tenant Company" />

            {/* Container Outer dengan Background Soft Blue Glow */}
            <div className="relative flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-950 p-4 font-sans overflow-hidden py-12 transition-colors duration-300">
                {/* Back Button di Pojok Kiri Atas */}
                <Link
                    href="/"
                    className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs backdrop-blur-md transition-all hover:bg-white dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white hover:shadow-md active:scale-95"
                >
                    <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Back to Home
                </Link>

                {/* Decorative Background Blur Glows */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-100/60 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-200/40 dark:bg-blue-500/10 blur-3xl pointer-events-none" />

                {/* Main Card Container */}
                <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                    {/* Top Accent Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-indigo-600" />

                    {/* Header Logo & Title Section */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex items-center justify-center">
                            <AppLogo size="lg" showText={false} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Register Your Company
                        </h1>

                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 px-2">
                            Create your tenant account to manage your warehouse operations and inventory.
                        </p>
                    </div>

                    <Form action="/register-tenant" method="post" className="flex flex-col gap-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4">
                                    {/* Company / Warehouse Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="company_name" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Building className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Company / Warehouse Name
                                        </Label>
                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            required
                                            autoFocus
                                            placeholder="e.g. PT Logistics Jaya"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 pl-3 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.company_name} />
                                    </div>

                                    {/* Admin Full Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Admin Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            required
                                            placeholder="John Doe"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 pl-3 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Admin Email Address */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Admin Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="admin@company.com"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 pl-3 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Subscription Plan */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="plan_id" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Subscription Plan
                                        </Label>
                                        <select
                                            id="plan_id"
                                            name="plan_id"
                                            defaultValue={selectedPlanId || (plans[0]?.id ?? 1)}
                                            className="h-11 w-full rounded-md border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50 px-3 text-sm text-slate-800 dark:text-slate-200 shadow-xs transition-all focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        >
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                                                    {plan.name} - ${plan.price}/mo
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.plan_id} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Password
                                        </Label>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            placeholder="••••••••••••••••"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                            <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                            Confirm Password
                                        </Label>
                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            placeholder="••••••••••••••••"
                                            className="h-11 border-slate-200/80 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100 dark:placeholder:text-slate-500 text-sm transition-all focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:focus:border-blue-500"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="mt-2 h-11 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 font-semibold text-white shadow-md shadow-blue-600/25 dark:shadow-blue-950/50 transition-all active:scale-[0.99] disabled:opacity-70"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <Spinner className="mr-2 h-4 w-4" />
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                Create Account & Start Trial
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

TenantRegister.layout = (page: React.ReactNode) => page;
