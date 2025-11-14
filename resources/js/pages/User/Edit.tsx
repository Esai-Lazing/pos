import AppLayout from '@/layouts/app-layout';
import * as userRoutes from '@/routes/user';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, Form } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'caisse' | 'stock';
    is_active: boolean;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Utilisateurs',
        href: userRoutes.index().url,
    },
    {
        title: 'Modifier',
        href: '#',
    },
];

export default function UserEdit({ user }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Modifier ${user.name}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link
                        href={userRoutes.show({ user: user.id }).url}
                        className="rounded-lg border border-border bg-background p-2 hover:bg-accent"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <h1 className="text-2xl font-bold">Modifier l'utilisateur</h1>
                </div>

                <Form
                    method="put"
                    action={userRoutes.update({ user: user.id }).url}
                    className="rounded-lg border border-border bg-card p-6"
                >
                    {({ processing, errors }) => (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    defaultValue={user.name}
                                    required
                                    autoComplete="name"
                                    placeholder="Nom complet"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={user.email}
                                    required
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">Rôle</Label>
                                <select
                                    id="role"
                                    name="role"
                                    defaultValue={user.role}
                                    required
                                    className="rounded-lg border border-input bg-background px-3 py-2"
                                >
                                    <option value="admin">Administrateur</option>
                                    <option value="caisse">Caisse</option>
                                    <option value="stock">Stock</option>
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    defaultChecked={user.is_active}
                                    value="1"
                                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary"
                                />
                                <Label htmlFor="is_active" className="cursor-pointer">
                                    Compte actif
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                                <Link
                                    href={userRoutes.show({ user: user.id }).url}
                                    className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                                >
                                    Annuler
                                </Link>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </AppLayout>
    );
}

