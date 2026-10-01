import { Link, useForm } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Unit {
    id?: number;
    name: string;
    symbol: string;
}

interface Props {
    tenant_slug: string;
    unit?: Unit;
    mode: 'create' | 'edit';
}

export default function UnitForm({
    tenant_slug,
    unit,
    mode,
}: Props) {
    const isEdit = mode === 'edit';

    const form = useForm({
        name: unit?.name ?? '',
        symbol: unit?.symbol ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && unit?.id) {
            form.put(
                `/${tenant_slug}/inventory/units/${unit.id}`,
            );
        } else {
            form.post(`/${tenant_slug}/inventory/units`);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            {/* Unit Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                >
                    Unit Name
                </label>

                <Input
                    id="name"
                    type="text"
                    value={form.data.name}
                    onChange={(e) =>
                        form.setData('name', e.target.value)
                    }
                    placeholder="Enter unit name"
                />

                {form.errors.name && (
                    <p className="text-sm text-red-500">
                        {form.errors.name}
                    </p>
                )}
            </div>

            {/* Unit Symbol */}
            <div className="space-y-2">
                <label
                    htmlFor="symbol"
                    className="text-sm font-medium text-foreground"
                >
                    Unit Symbol
                </label>
                <Input
                    id="symbol"
                    type="text"
                    value={form.data.symbol}
                    onChange={(e) =>
                        form.setData('symbol', e.target.value)
                    }
                    placeholder="Enter unit symbol"
                />
                {form.errors.symbol && (
                    <p className="text-sm text-red-500">
                        {form.errors.symbol}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
                <Button variant="outline" type="button" asChild>
                    <Link
                        href={`/${tenant_slug}/inventory/units`}
                    >
                        Cancel
                    </Link>
                </Button>

                <Button type="submit" disabled={form.processing}>
                    {form.processing
                        ? 'Saving...'
                        : isEdit
                          ? 'Update Unit'
                          : 'Create Unit'}
                </Button>
            </div>
        </form>
    );
}