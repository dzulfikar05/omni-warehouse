import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';

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
        <AuthLayout
            title="Register Your Company"
            description="Create your tenant account to manage your warehouse operations"
        >
            <Head title="Sign Up Tenant" />

            <Form action="/register-tenant" method="post" className="flex flex-col gap-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Company / Warehouse Name</Label>
                            <Input
                                id="company_name"
                                name="company_name"
                                required
                                autoFocus
                                placeholder="e.g. PT Logistics Jaya"
                            />
                            <InputError message={errors.company_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Admin Full Name</Label>
                            <Input id="name" name="name" required placeholder="John Doe" />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Admin Email Address</Label>
                            <Input id="email" type="email" name="email" required placeholder="admin@company.com" />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="plan_id">Subscription Plan</Label>
                            <select
                                id="plan_id"
                                name="plan_id"
                                defaultValue={selectedPlanId || (plans[0]?.id ?? 1)}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ${plan.price}/mo
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.plan_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput id="password" name="password" required placeholder="Password" />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                placeholder="Confirm Password"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button type="submit" className="mt-2 w-full" disabled={processing}>
                            {processing && <Spinner />}
                            Create Account & Start Trial
                        </Button>

                        <div className="text-center text-xs text-muted-foreground mt-2">
                            Already registered?{' '}
                            <Link href="/demo-tenant/login" className="text-primary underline font-medium">
                                Sign In
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
