import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { Upload, Save } from 'lucide-react';
import { useState } from 'react';

interface RestaurantCustomization {
    id: number;
    restaurant_id: number;
    logo?: string;
    logo_url?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    code_postal?: string;
    description?: string;
    site_web?: string;
    couleur_principale?: string;
    reseaux_sociaux?: Record<string, string>;
    horaires?: Record<string, any>;
}

interface Props {
    customization: RestaurantCustomization;
}

export default function RestaurantCustomization({ customization }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        logo: null as File | null,
        adresse: customization.adresse || '',
        ville: customization.ville || '',
        pays: customization.pays || '',
        code_postal: customization.code_postal || '',
        description: customization.description || '',
        site_web: customization.site_web || '',
        couleur_principale: customization.couleur_principale || '#000000',
        reseaux_sociaux: customization.reseaux_sociaux || {},
        horaires: customization.horaires || {},
        restaurant_id: customization.restaurant_id,
        _method: 'PUT',
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        customization.logo_url || (customization.logo ? `/storage/${customization.logo}` : null)
    );

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/restaurant/customization', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-4">
                <div>
                    <h1 className="text-3xl font-bold">Personnalisation de l'espace</h1>
                    <p className="text-muted-foreground">Personnalisez l'apparence et les informations de votre restaurant</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-xl font-semibold">Logo</h2>
                        <div className="flex items-center gap-6">
                            {logoPreview && (
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="h-24 w-24 rounded-lg object-cover"
                                />
                            )}
                            <div>
                                <label
                                    htmlFor="logo"
                                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-muted"
                                >
                                    <Upload className="h-4 w-4" />
                                    {logoPreview ? 'Changer le logo' : 'Télécharger un logo'}
                                </label>
                                <input
                                    type="file"
                                    id="logo"
                                    name="logo"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                {errors.logo && (
                                    <p className="mt-1 text-sm text-destructive">{errors.logo}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 text-xl font-semibold">Informations de base</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="adresse" className="mb-2 block text-sm font-medium">
                                    Adresse
                                </label>
                                <input
                                    type="text"
                                    id="adresse"
                                    value={data.adresse}
                                    onChange={(e) => setData('adresse', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.adresse && (
                                    <p className="mt-1 text-sm text-destructive">{errors.adresse}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="ville" className="mb-2 block text-sm font-medium">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    id="ville"
                                    value={data.ville}
                                    onChange={(e) => setData('ville', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.ville && (
                                    <p className="mt-1 text-sm text-destructive">{errors.ville}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="pays" className="mb-2 block text-sm font-medium">
                                    Pays
                                </label>
                                <input
                                    type="text"
                                    id="pays"
                                    value={data.pays}
                                    onChange={(e) => setData('pays', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.pays && (
                                    <p className="mt-1 text-sm text-destructive">{errors.pays}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="code_postal" className="mb-2 block text-sm font-medium">
                                    Code postal
                                </label>
                                <input
                                    type="text"
                                    id="code_postal"
                                    value={data.code_postal}
                                    onChange={(e) => setData('code_postal', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.code_postal && (
                                    <p className="mt-1 text-sm text-destructive">{errors.code_postal}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="site_web" className="mb-2 block text-sm font-medium">
                                    Site web
                                </label>
                                <input
                                    type="url"
                                    id="site_web"
                                    value={data.site_web}
                                    onChange={(e) => setData('site_web', e.target.value)}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {errors.site_web && (
                                    <p className="mt-1 text-sm text-destructive">{errors.site_web}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="couleur_principale" className="mb-2 block text-sm font-medium">
                                    Couleur principale
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="color"
                                        id="couleur_principale"
                                        value={data.couleur_principale}
                                        onChange={(e) => setData('couleur_principale', e.target.value)}
                                        className="h-10 w-20 cursor-pointer rounded-lg border border-input"
                                    />
                                    <input
                                        type="text"
                                        value={data.couleur_principale}
                                        onChange={(e) => setData('couleur_principale', e.target.value)}
                                        className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                {errors.couleur_principale && (
                                    <p className="mt-1 text-sm text-destructive">{errors.couleur_principale}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

