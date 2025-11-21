import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';
import { Upload, Save, Type, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

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
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    show_banner?: boolean;
    banner_image?: string;
    banner_url?: string;
    custom_css?: Record<string, any>;
}

interface Props {
    customization: RestaurantCustomization;
}

export default function RestaurantCustomization({ customization }: Props) {
    const { restaurant } = usePage<SharedData>().props;

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
        custom_css: customization.custom_css || {},
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

        // Envoyer le formulaire - Inertia enverra automatiquement tous les champs de data
        post('/restaurant/customization', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Sparkles className="h-8 w-8" />
                            Personnalisation de l'espace
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Personnalisez l'apparence et les informations de votre restaurant. Les modifications sont visibles en temps réel.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
                    {/* Identité visuelle */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="h-5 w-5" />
                                Identité visuelle
                            </CardTitle>
                            <CardDescription>
                                Logo de votre restaurant
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo</Label>
                                <div className="flex items-center gap-4">
                                    {logoPreview && (
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="h-20 w-20 rounded-lg object-cover border border-border"
                                        />
                                    )}
                                    <Label
                                        htmlFor="logo"
                                        className="cursor-pointer"
                                    >
                                        <Button type="button" variant="outline" asChild>
                                            <span>
                                                <Upload className="h-4 w-4 mr-2" />
                                                {logoPreview ? 'Changer' : 'Télécharger'}
                                            </span>
                                        </Button>
                                        <input
                                            type="file"
                                            id="logo"
                                            name="logo"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                    </Label>
                                </div>
                                {errors.logo && (
                                    <p className="text-sm text-destructive">{errors.logo}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Type className="h-5 w-5" />
                                Informations du restaurant
                            </CardTitle>
                            <CardDescription>
                                Coordonnées et description de votre établissement
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse</Label>
                                    <Input
                                        id="adresse"
                                        value={data.adresse}
                                        onChange={(e) => setData('adresse', e.target.value)}
                                        placeholder="123 Rue Example"
                                    />
                                    {errors.adresse && (
                                        <p className="text-sm text-destructive">{errors.adresse}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="ville">Ville</Label>
                                    <Input
                                        id="ville"
                                        value={data.ville}
                                        onChange={(e) => setData('ville', e.target.value)}
                                        placeholder="Kinshasa"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pays">Pays</Label>
                                    <Input
                                        id="pays"
                                        value={data.pays}
                                        onChange={(e) => setData('pays', e.target.value)}
                                        placeholder="RD Congo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="code_postal">Code postal</Label>
                                    <Input
                                        id="code_postal"
                                        value={data.code_postal}
                                        onChange={(e) => setData('code_postal', e.target.value)}
                                        placeholder="00000"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        placeholder="Décrivez votre restaurant..."
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label htmlFor="site_web">Site web</Label>
                                    <Input
                                        id="site_web"
                                        type="url"
                                        value={data.site_web}
                                        onChange={(e) => setData('site_web', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    <div className="flex justify-end gap-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="lg"
                            className="min-w-[200px]"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Enregistrement...' : 'Enregistrer les modifications'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}