import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, LucideEye, Pencil, Trash } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface ActionButtonProps {
    label: string; // Nama data (misal: "Admin", "User A")
    showUrl?: string;
    editUrl?: string;
    onDelete: () => void;
    canShow?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export function ActionButton({
    label,
    showUrl,
    editUrl,
    onDelete,
    canShow = false,
    canEdit = false,
    canDelete = false,
}: ActionButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Action</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">

                {canShow && showUrl && (
                    <DropdownMenuItem asChild>
                        <Link href={showUrl} className="flex cursor-pointer items-center">
                            <LucideEye className="mr-2 h-4 w-4" /> View Details
                        </Link>
                    </DropdownMenuItem>
                )}

                {canEdit && editUrl && (
                    <DropdownMenuItem asChild>
                        <Link href={editUrl} className="flex cursor-pointer items-center">
                            <Pencil className="mr-2 h-4 w-4" /> Edit Data
                        </Link>
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
                                <Trash className="mr-2 h-4 w-4 text-red-600" /> Delete
                            </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete <strong>{label}</strong>? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onDelete}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
