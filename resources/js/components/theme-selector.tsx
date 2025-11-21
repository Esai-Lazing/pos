import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/hooks/use-theme';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Palette, Sparkles } from 'lucide-react';

export default function ThemeSelector() {
    const { theme, updateTheme, themes } = useTheme();
    const page = usePage<SharedData>();
    const { restaurant, auth } = page.props;
    const customization = restaurant?.customization;
    const hasRestaurantTheme = !!(customization?.primary_color || customization?.couleur_principale);

    // Vérifier si l'utilisateur est admin et a accès à la personnalisation
    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'super-admin';
    const hasAccess = isAdmin && (restaurant?.subscriptionLimitations?.personnalisation ?? false);

    // Ne pas afficher le sélecteur si l'utilisateur n'a pas accès
    if (!hasAccess) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-md"
                >
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Changer le thème</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Thème de couleur
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {themes.map((themeOption) => (
                    <DropdownMenuItem
                        key={themeOption.name}
                        onClick={() => updateTheme(themeOption.name)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div
                            className="h-4 w-4 rounded-full border border-border"
                            style={{ backgroundColor: themeOption.primary }}
                        />
                        <span>{themeOption.label}</span>
                        {theme === themeOption.name && (
                            <span className="ml-auto text-xs">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
                {hasRestaurantTheme && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => updateTheme('restaurant')}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Identité visuelle</span>
                            {theme === 'restaurant' && (
                                <span className="ml-auto text-xs">✓</span>
                            )}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

