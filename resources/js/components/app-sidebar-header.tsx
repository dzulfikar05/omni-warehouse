import React from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem } from '@/types';
// 1. Import komponen Export Notification Dropdown
import { ExportNotificationDropdown } from '@/components/export-notification-dropdown';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            {/* Bagian Kiri: Sidebar Toggle & Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Bagian Kanan: Ikon Notifikasi Export */}
            <div className="flex items-center gap-2">
                <ExportNotificationDropdown />
            </div>
        </header>
    );
}
