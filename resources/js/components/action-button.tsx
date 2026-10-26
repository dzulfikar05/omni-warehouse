import { Link } from '@inertiajs/react';
import { LucideEye, Pencil, Trash } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/context/language-context';

interface ActionButtonProps {
    label: string; // Nama data (misal: "Admin", "User A")
    showUrl?: string;
    editUrl?: string;
    onEdit?: () => void;
    onDelete: () => void;
    canShow?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export function ActionButton({
    label,
    showUrl,
    editUrl,
    onEdit,
    onDelete,
    canShow = false,
    canEdit = false,
    canDelete = false,
}: ActionButtonProps) {
    const { t } = useTranslation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">{t('Action')}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">

                {canShow && showUrl && (
                    <DropdownMenuItem asChild>
                        <Link href={showUrl} className="flex cursor-pointer items-center">
                            <LucideEye className="mr-2 h-4 w-4" /> {t('View Details')}
                        </Link>
                    </DropdownMenuItem>
                )}

                {canEdit && (editUrl || onEdit) && (
                    <DropdownMenuItem
                        asChild={!!editUrl}
                        onSelect={() => {
                            if (onEdit) {
onEdit();
}
                        }}
                    >
                        {editUrl ? (
                            <Link href={editUrl} className="flex cursor-pointer items-center">
                                <Pencil className="mr-2 h-4 w-4" /> {t('Edit Data')}
                            </Link>
                        ) : (
                            <div className="flex cursor-pointer items-center w-full">
                                <Pencil className="mr-2 h-4 w-4" /> {t('Edit Data')}
                            </div>
                        )}
                    </DropdownMenuItem>
                )}

                {(canShow || canEdit) && canDelete && <DropdownMenuSeparator />}

                {canDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                                <Trash className="mr-2 h-4 w-4 text-red-600" /> {t('Delete')}
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('Delete Data?')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('Are you sure you want to delete')}{' '}
                                    <strong>{label}</strong>? {t('This action cannot be undone.')}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    {t('Delete')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
