# Guide d'installation et d'utilisation de Laravel Lang

## Installation

Le package `laravel-lang/lang` a été installé avec succès dans votre projet.

## Commandes disponibles

### Ajouter une nouvelle langue
```bash
php artisan lang:add fr
php artisan lang:add en
```

### Mettre à jour les traductions
```bash
php artisan lang:update
```

### Supprimer une langue
```bash
php artisan lang:rm fr
```

### Réinitialiser toutes les langues
```bash
php artisan lang:reset
```

### Publier les fichiers de langue pour personnalisation
```bash
php artisan lang:publish
```

## Structure des fichiers

### Fichiers générés par laravel-lang
- `lang/fr/auth.php` - Messages d'authentification
- `lang/fr/validation.php` - Messages de validation
- `lang/fr/pagination.php` - Messages de pagination
- `lang/fr/passwords.php` - Messages de réinitialisation de mot de passe
- `lang/fr/actions.php` - Actions Laravel
- `lang/fr/http-statuses.php` - Codes de statut HTTP
- `lang/fr.json` - Traductions JSON (pour les messages dynamiques)

### Fichiers personnalisés (à conserver)
- `lang/fr/common.php` - Termes communs de l'application POS
- `lang/fr/stock.php` - Traductions pour la gestion du stock
- `lang/fr/sales.php` - Traductions pour les ventes
- `lang/fr/reports.php` - Traductions pour les rapports
- `lang/fr/printer.php` - Traductions pour l'imprimante

## Utilisation

### Dans les contrôleurs PHP
```php
// Messages de validation
return redirect()->back()->withErrors([
    'email' => trans('validation.email', ['attribute' => 'email'])
]);

// Messages flash
return redirect()->back()->with('success', trans('stock.product_created_successfully'));

// Utilisation directe
$message = __('auth.login');
```

### Dans les composants React
```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function MonComposant() {
    const { t, trans } = useTranslation();
    
    return (
        <div>
            <h1>{trans.common('dashboard')}</h1>
            <button>{trans.stock('add_product')}</button>
        </div>
    );
}
```

### Dans les Form Requests
Les messages de validation sont automatiquement traduits grâce à `lang/fr/validation.php`.

## Personnalisation

Pour personnaliser les traductions de laravel-lang :

1. Publier les fichiers :
```bash
php artisan lang:publish
```

2. Modifier les fichiers dans `lang/fr/`

3. Les modifications seront conservées lors des mises à jour

## Notes importantes

- Les fichiers personnalisés (`common.php`, `stock.php`, etc.) ne sont pas écrasés par `lang:update`
- Les attributs personnalisés dans `validation.php` sont automatiquement fusionnés
- Utilisez `lang:update` régulièrement pour obtenir les dernières traductions

