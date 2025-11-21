import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TypographySettings {
    font_family: string;
    font_size: 'small' | 'normal' | 'large';
}

interface TypographyContextType {
    settings: TypographySettings;
    updateSettings: (settings: Partial<TypographySettings>) => void;
}

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

const defaultSettings: TypographySettings = {
    font_family: 'Instrument Sans',
    font_size: 'normal',
};

interface TypographyProviderProps {
    children: ReactNode;
    initialSettings?: Partial<TypographySettings>;
}

export function TypographyProvider({ children, initialSettings }: TypographyProviderProps) {
    // Récupérer les paramètres depuis les props ou localStorage
    const getInitialSettings = (): TypographySettings => {
        // Priorité 1: Paramètres initiaux (depuis le restaurant)
        if (initialSettings) {
            return {
                font_family: initialSettings.font_family || defaultSettings.font_family,
                font_size: initialSettings.font_size || defaultSettings.font_size,
            };
        }
        
        // Priorité 2: localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('restaurant_typography');
            if (saved) {
                try {
                    return { ...defaultSettings, ...JSON.parse(saved) };
                } catch {
                    return defaultSettings;
                }
            }
        }
        
        return defaultSettings;
    };

    const [settings, setSettings] = useState<TypographySettings>(getInitialSettings);

    // Synchroniser avec les paramètres initiaux quand ils changent
    useEffect(() => {
        if (initialSettings) {
            setSettings((prev) => ({
                font_family: initialSettings.font_family ?? prev.font_family,
                font_size: initialSettings.font_size ?? prev.font_size,
            }));
        }
    }, [initialSettings]);

    const updateSettings = (newSettings: Partial<TypographySettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (typeof window !== 'undefined') {
                localStorage.setItem('restaurant_typography', JSON.stringify(updated));
            }
            return updated;
        });
    };

    // Apply typography globally
    // Note: La typographie utilise maintenant uniquement les valeurs par défaut
    // La police est gérée par Tailwind CSS via app.css
    // Plus besoin d'appliquer de styles dynamiques

    return (
        <TypographyContext.Provider value={{ settings, updateSettings }}>
            {children}
        </TypographyContext.Provider>
    );
}

export function useTypography() {
    const context = useContext(TypographyContext);
    if (context === undefined) {
        // Retourner des valeurs par défaut au lieu de lancer une erreur
        // Cela permet au composant de fonctionner même si le provider n'est pas encore monté
        return {
            settings: defaultSettings,
            updateSettings: () => {
                // No-op si le provider n'est pas disponible
            },
        };
    }
    return context;
}

