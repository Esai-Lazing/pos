import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';

export type ThemeName = 'default' | 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'violet' | 'restaurant';

interface Theme {
    name: ThemeName;
    label: string;
    primary: string;
    secondary: string;
}

const defaultThemes: Theme[] = [
    { name: 'default', label: 'Par défaut', primary: 'oklch(0.205 0 0)', secondary: 'oklch(0.97 0 0)' },
    { name: 'blue', label: 'Bleu', primary: 'oklch(0.5 0.2 250)', secondary: 'oklch(0.95 0.05 250)' },
    { name: 'green', label: 'Vert', primary: 'oklch(0.5 0.2 150)', secondary: 'oklch(0.95 0.05 150)' },
    { name: 'red', label: 'Rouge', primary: 'oklch(0.55 0.22 25)', secondary: 'oklch(0.95 0.05 25)' },
    { name: 'orange', label: 'Orange', primary: 'oklch(0.65 0.2 70)', secondary: 'oklch(0.95 0.05 70)' },
    { name: 'yellow', label: 'Jaune', primary: 'oklch(0.75 0.15 90)', secondary: 'oklch(0.95 0.05 90)' },
    { name: 'violet', label: 'Violet', primary: 'oklch(0.5 0.2 300)', secondary: 'oklch(0.95 0.05 300)' },
];

// Convertir hex en oklch (approximation simplifiée mais fonctionnelle)
function hexToOklch(hex: string): string {
    // Convertir hex en RGB
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    // Convertir RGB en Linear RGB
    const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rLinear = toLinear(r);
    const gLinear = toLinear(g);
    const bLinear = toLinear(b);

    // Convertir en XYZ (D65)
    const x = (rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375);
    const y = (rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750);
    const z = (rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041);

    // Convertir en Lab
    const fx = x > 0.008856 ? Math.cbrt(x) : (7.787 * x + 16 / 116);
    const fy = y > 0.008856 ? Math.cbrt(y) : (7.787 * y + 16 / 116);
    const fz = z > 0.008856 ? Math.cbrt(z) : (7.787 * z + 16 / 116);

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const bLab = 200 * (fy - fz);

    // Convertir Lab en LCH
    const c = Math.sqrt(a * a + bLab * bLab);
    let h = Math.atan2(bLab, a) * (180 / Math.PI);
    if (h < 0) h += 360;

    // Approximation OKLCH depuis Lab (OKLCH utilise une courbe de luminosité différente)
    // Pour simplifier, on utilise une approximation directe
    const lOk = Math.max(0, Math.min(1, l / 100));
    const cOk = Math.max(0, Math.min(0.4, c / 150));
    const hOk = h;

    return `oklch(${lOk.toFixed(3)} ${cOk.toFixed(3)} ${hOk.toFixed(1)})`;
}

// Fonction simplifiée pour obtenir une couleur secondaire à partir d'une primaire
function getSecondaryFromPrimary(primaryHex: string): string {
    // Pour simplifier, on utilise une version plus claire de la couleur primaire
    const r = parseInt(primaryHex.slice(1, 3), 16);
    const g = parseInt(primaryHex.slice(3, 5), 16);
    const b = parseInt(primaryHex.slice(5, 7), 16);

    // Créer une version très claire (presque blanc avec une teinte)
    const rLight = Math.min(255, r + 200);
    const gLight = Math.min(255, g + 200);
    const bLight = Math.min(255, b + 200);

    const hexLight = `#${rLight.toString(16).padStart(2, '0')}${gLight.toString(16).padStart(2, '0')}${bLight.toString(16).padStart(2, '0')}`;
    return hexToOklch(hexLight);
}

function applyTheme(theme: Theme, isDark: boolean, customization?: { primary_color?: string; couleur_principale?: string; secondary_color?: string } | null) {
    const root = document.documentElement;

    if (theme.name === 'restaurant' && customization) {
        // Utiliser les couleurs du restaurant
        const primaryHex = customization.primary_color || customization.couleur_principale || '#000000';
        const secondaryHex = customization.secondary_color || '#ffffff';

        const primaryOklch = hexToOklch(primaryHex);
        const secondaryOklch = hexToOklch(secondaryHex);

        // Calculer primary-foreground (contraste)
        const brightness = getBrightness(primaryHex);
        const primaryForeground = brightness > 128 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';
        const secondaryForeground = getBrightness(secondaryHex) > 128 ? 'oklch(0.145 0 0)' : 'oklch(0.985 0 0)';

        root.style.setProperty('--primary', primaryOklch);
        root.style.setProperty('--primary-foreground', primaryForeground);
        root.style.setProperty('--secondary', secondaryOklch);
        root.style.setProperty('--secondary-foreground', secondaryForeground);
    } else if (theme.name === 'default') {
        // Pour le thème par défaut, utiliser les valeurs CSS par défaut
        // En supprimant les propriétés personnalisées, on laisse les valeurs du CSS prendre le relais
        root.style.removeProperty('--primary');
        root.style.removeProperty('--primary-foreground');
        root.style.removeProperty('--secondary');
        root.style.removeProperty('--secondary-foreground');
    } else {
        // Utiliser les thèmes prédéfinis
        if (isDark) {
            // Pour dark mode, on inverse généralement les couleurs
            root.style.setProperty('--primary', theme.primary);
            root.style.setProperty('--primary-foreground', 'oklch(0.985 0 0)');
            root.style.setProperty('--secondary', theme.secondary);
            root.style.setProperty('--secondary-foreground', 'oklch(0.985 0 0)');
        } else {
            root.style.setProperty('--primary', theme.primary);
            root.style.setProperty('--primary-foreground', 'oklch(0.985 0 0)');
            root.style.setProperty('--secondary', theme.secondary);
            root.style.setProperty('--secondary-foreground', 'oklch(0.145 0 0)');
        }
    }
}

function getBrightness(hex: string): number {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

export function useTheme() {
    const page = usePage<SharedData>();
    const restaurant = page.props.restaurant;
    const customization = restaurant?.customization;

    // Utiliser des refs pour suivre le thème actuellement appliqué et éviter les réapplications inutiles
    const lastAppliedTheme = useRef<ThemeName | null>(null);
    const isUpdatingRef = useRef(false);
    const userSelectedThemeRef = useRef<ThemeName | null>(null);

    // Charger le thème depuis localStorage en priorité pour une application immédiate
    const [theme, setTheme] = useState<ThemeName>(() => {
        // Priorité 1: localStorage (pour une application immédiate)
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme') as ThemeName | null;
            if (saved) {
                userSelectedThemeRef.current = saved;
                return saved;
            }
        }
        // Priorité 2: Thème depuis la base de données (restaurant)
        if (customization?.theme) {
            // Synchroniser localStorage avec la base de données
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', customization.theme);
            }
            userSelectedThemeRef.current = customization.theme as ThemeName;
            return customization.theme as ThemeName;
        }
        return 'default';
    });

    // Synchroniser le thème avec les props uniquement au premier chargement
    // Ne pas synchroniser automatiquement après pour éviter les conflits avec les sélections utilisateur
    const hasInitializedRef = useRef(false);
    const lastKnownDbTheme = useRef<ThemeName | null>(null);

    useEffect(() => {
        const dbTheme = customization?.theme as ThemeName | undefined;

        // Seulement synchroniser au premier chargement
        if (!hasInitializedRef.current) {
            if (dbTheme) {
                lastKnownDbTheme.current = dbTheme;
                if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
                    setTheme(dbTheme);
                    localStorage.setItem('theme', dbTheme);
                    userSelectedThemeRef.current = dbTheme;
                } else if (typeof window !== 'undefined') {
                    // Si localStorage existe, l'utiliser en priorité
                    const saved = localStorage.getItem('theme') as ThemeName | null;
                    if (saved) {
                        userSelectedThemeRef.current = saved;
                    }
                }
            }
            hasInitializedRef.current = true;
            return;
        }

        // Après l'initialisation, ignorer les changements de props si l'utilisateur a sélectionné un thème
        // Ne mettre à jour que si le thème de la DB a vraiment changé ET que l'utilisateur n'a pas fait de sélection
        if (dbTheme && dbTheme !== lastKnownDbTheme.current) {
            lastKnownDbTheme.current = dbTheme;
            // Ne pas forcer le changement si l'utilisateur a fait une sélection récente ou si on est en train de mettre à jour
            // OU si le thème actuel correspond à celui sélectionné par l'utilisateur
            if (!userSelectedThemeRef.current && !isUpdatingRef.current) {
                // Le thème de la DB a changé (peut-être par un autre utilisateur/admin)
                // Mais seulement si l'utilisateur n'a pas fait de sélection récente
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem('theme') as ThemeName | null;
                    // Ne mettre à jour que si le localStorage correspond au nouveau thème de la DB
                    // ou s'il n'y a pas de thème dans localStorage
                    if (!saved || saved === dbTheme) {
                        setTheme(dbTheme);
                        localStorage.setItem('theme', dbTheme);
                    } else {
                        // Le localStorage a un thème différent, le garder (priorité utilisateur)
                        userSelectedThemeRef.current = saved;
                    }
                }
            } else if (userSelectedThemeRef.current && userSelectedThemeRef.current !== dbTheme) {
                // L'utilisateur a sélectionné un thème différent de celui de la DB
                // Garder le thème sélectionné par l'utilisateur
                // Ne rien faire, le thème utilisateur reste actif
            }
        } else if (dbTheme) {
            lastKnownDbTheme.current = dbTheme;
        }
    }, [customization?.theme]);

    const updateTheme = useCallback((newTheme: ThemeName) => {
        // Marquer qu'on est en train de mettre à jour pour éviter les réapplications
        isUpdatingRef.current = true;
        userSelectedThemeRef.current = newTheme;

        // Appliquer le thème immédiatement avant même de sauvegarder
        const isDark = document.documentElement.classList.contains('dark');
        const selectedTheme = newTheme === 'restaurant'
            ? { name: 'restaurant' as ThemeName, label: 'Restaurant', primary: '', secondary: '' }
            : defaultThemes.find(t => t.name === newTheme) || defaultThemes[0];

        applyTheme(selectedTheme, isDark, customization);
        lastAppliedTheme.current = newTheme;

        // Mettre à jour l'état
        setTheme(newTheme);

        // Sauvegarder dans localStorage immédiatement pour une meilleure expérience utilisateur
        if (typeof window !== 'undefined') {
            localStorage.setItem('theme', newTheme);
        }

        // Sauvegarder dans la base de données via Inertia
        // Utiliser 'only' pour éviter de mettre à jour les props partagées qui pourraient réinitialiser le thème
        router.patch('/restaurant/customization/theme', { theme: newTheme }, {
            preserveState: true,
            preserveScroll: true,
            only: [], // Ne pas mettre à jour les props pour éviter les conflits
            onSuccess: () => {
                // Réinitialiser le flag après succès, mais garder le thème sélectionné
                isUpdatingRef.current = false;
            },
            onError: () => {
                // Réinitialiser le flag
                isUpdatingRef.current = false;
                userSelectedThemeRef.current = null;

                // Revenir au thème précédent en cas d'erreur
                const previousTheme = customization?.theme || localStorage.getItem('theme') || 'default';
                setTheme(previousTheme as ThemeName);

                // Restaurer le thème visuellement
                const previousSelectedTheme = previousTheme === 'restaurant'
                    ? { name: 'restaurant' as ThemeName, label: 'Restaurant', primary: '', secondary: '' }
                    : defaultThemes.find(t => t.name === previousTheme) || defaultThemes[0];
                applyTheme(previousSelectedTheme, isDark, customization);
                lastAppliedTheme.current = previousTheme as ThemeName;

                // Restaurer le localStorage aussi
                if (typeof window !== 'undefined') {
                    localStorage.setItem('theme', previousTheme as string);
                }
            },
        });
    }, [customization]);

    // Appliquer le thème automatiquement au chargement et quand il change
    useEffect(() => {
        // Ne pas réappliquer si c'est le même thème ou si on est en train de mettre à jour
        if (lastAppliedTheme.current === theme || isUpdatingRef.current) {
            return;
        }

        // Si l'utilisateur a sélectionné un thème, ne pas le réappliquer depuis les props
        if (userSelectedThemeRef.current && userSelectedThemeRef.current !== theme) {
            // Garder le thème sélectionné par l'utilisateur
            setTheme(userSelectedThemeRef.current);
            return;
        }

        const isDark = document.documentElement.classList.contains('dark');
        const selectedTheme = theme === 'restaurant'
            ? { name: 'restaurant' as ThemeName, label: 'Restaurant', primary: '', secondary: '' }
            : defaultThemes.find(t => t.name === theme) || defaultThemes[0];

        applyTheme(selectedTheme, isDark, customization);
        lastAppliedTheme.current = theme;
    }, [theme]);

    // Écouter les changements de dark mode
    useEffect(() => {
        const observer = new MutationObserver(() => {
            // Utiliser le thème actuellement appliqué, pas celui des props
            const currentTheme = userSelectedThemeRef.current || theme;
            const isDark = document.documentElement.classList.contains('dark');
            const selectedTheme = currentTheme === 'restaurant'
                ? { name: 'restaurant' as ThemeName, label: 'Restaurant', primary: '', secondary: '' }
                : defaultThemes.find(t => t.name === currentTheme) || defaultThemes[0];

            applyTheme(selectedTheme, isDark, customization);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, [theme, customization]);

    return { theme, updateTheme, themes: defaultThemes };
}

