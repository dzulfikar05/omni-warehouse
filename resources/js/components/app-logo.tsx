import React from 'react';

interface AppLogoProps extends React.SVGProps<SVGSVGElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | number;
    showText?: boolean;
    tenantName?: string;
}

export default function AppLogo({
    size = 'md',
    showText = true,
    tenantName,
    className = '',
    ...props
}: AppLogoProps) {
    const sizeMap = {
        sm: { icon: 24, text: 'text-xs', tenantText: 'text-sm' },
        md: { icon: 32, text: 'text-sm', tenantText: 'text-base' },
        lg: { icon: 48, text: 'text-base', tenantText: 'text-lg' },
        xl: { icon: 64, text: 'text-xl', tenantText: 'text-2xl' },
    };

    const currentSize = typeof size === 'string' ? sizeMap[size] : sizeMap.md;
    const iconSize = typeof size === 'number' ? size : currentSize.icon;

    return (
        <div className={`inline-flex items-center gap-3 ${className}`}>
            {/* SVG Logo Container */}
            <div className="inline-flex flex-col items-center justify-center shrink-0">
                <svg
                    width={iconSize}
                    height={iconSize}
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    {...props}
                >
                    {/* Box Base (Kardus Terbuka) */}
                    <path
                        d="M 12 28 L 32 38 L 52 28 L 32 18 Z"
                        stroke="#2563EB"
                        strokeWidth="3.5"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 12 28 L 12 48 L 32 58 L 52 48 L 52 28"
                        stroke="#1D4ED8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 32 38 L 32 58"
                        stroke="#1D4ED8"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                    />

                    {/* Top Flaps (Tutup Kardus Terbuka) */}
                    <path
                        d="M 12 28 L 4 18 L 24 8 L 32 18"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 52 28 L 60 18 L 40 8 L 32 18"
                        stroke="#3B82F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Arrow Up (Panah Keluar/Kelola) */}
                    <path
                        d="M 32 44 L 32 20 M 32 20 L 25 27 M 32 20 L 39 27"
                        stroke="#1D4ED8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {showText && (
                    <span className={`font-black tracking-wider text-blue-600 uppercase text-[9px] -mt-0.5 leading-none`}>
                        WMS
                    </span>
                )}
            </div>

            {/* Nama Tenant / Brand Title */}
            {tenantName && (
                <div className="flex flex-col justify-center">
                    <span className={`font-bold tracking-tight text-slate-900 dark:text-white leading-tight ${currentSize.tenantText}`}>
                        {tenantName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                        Warehouse Operations
                    </span>
                </div>
            )}
        </div>
    );
}
