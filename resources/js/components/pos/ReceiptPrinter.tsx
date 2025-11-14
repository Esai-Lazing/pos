import { Printer } from '@/types/printer';
import { Vente } from '@/types/vente';
import { RestaurantCustomization } from '@/types/restaurant-customization';
import { useState } from 'react';
import * as venteRoutes from '@/routes/vente';

interface ReceiptPrinterProps {
    vente: Vente;
    printer: Printer | null;
    customization?: RestaurantCustomization | null;
    onPrint?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Composant pour l'impression de factures POS sur Android
 * Supporte Bluetooth, USB et Wi-Fi via Web Bluetooth/WebUSB API
 * Fallback vers window.print() pour impression standard
 */
export function ReceiptPrinter({ vente, printer, customization, onPrint, onError }: ReceiptPrinterProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const formatReceipt = (): string => {
        const lines: string[] = [];
        const width = printer?.largeur_papier || 80;

        // En-tête - Utiliser les données de personnalisation si disponibles, sinon l'imprimante
        const nomRestaurant = customization?.restaurant?.nom || printer?.nom_restaurant || 'Restaurant';
        const adresseRestaurant = customization?.adresse || printer?.adresse_restaurant || null;
        const villeRestaurant = customization?.ville || null;
        const paysRestaurant = customization?.pays || null;
        const codePostalRestaurant = customization?.code_postal || null;
        const telephoneRestaurant = customization?.restaurant?.telephone || printer?.telephone_restaurant || null;
        const siteWeb = customization?.site_web || null;
        
        lines.push(centerText(nomRestaurant, width));
        
        // Construire l'adresse complète
        if (adresseRestaurant) {
            let adresseComplete = adresseRestaurant;
            if (codePostalRestaurant) {
                adresseComplete += `, ${codePostalRestaurant}`;
            }
            if (villeRestaurant) {
                adresseComplete += ` ${villeRestaurant}`;
            }
            if (paysRestaurant) {
                adresseComplete += `, ${paysRestaurant}`;
            }
            lines.push(centerText(adresseComplete, width));
        }
        
        if (telephoneRestaurant) {
            lines.push(centerText(`Tél: ${telephoneRestaurant}`, width));
        }
        
        if (siteWeb) {
            lines.push(centerText(siteWeb, width));
        }
        
        lines.push('='.repeat(width));
        lines.push('');

        // Informations de la facture
        lines.push(`Facture: ${vente.numero_facture}`);
        lines.push(`Date: ${new Date(vente.created_at).toLocaleString('fr-CD')}`);
        lines.push('');

        // Articles
        lines.push('-'.repeat(width));
        lines.push(padRight('Article', 30) + padLeft('Qté', 10) + padLeft('Prix', 20) + padLeft('Total', 20));
        lines.push('-'.repeat(width));

        const modePaiement = vente.mode_paiement || 'fc';
        const afficherFC = modePaiement === 'fc' || modePaiement === 'mixte';
        const afficherUSD = modePaiement === 'usd' || modePaiement === 'mixte';

        vente.items?.forEach((item) => {
            const nom = item.produit?.nom || 'Produit';
            let ligne = padRight(nom.substring(0, 28), 30);

            if (afficherFC) {
                ligne += padLeft(item.quantite.toString(), 10);
                ligne += padLeft(`${Number(item.prix_unitaire_fc).toLocaleString('fr-CD')} FC`, 20);
                ligne += padLeft(`${(Number(item.prix_unitaire_fc) * item.quantite).toLocaleString('fr-CD')} FC`, 20);
            }

            if (afficherUSD && Number(item.prix_unitaire_usd || 0) > 0) {
                if (afficherFC) {
                    ligne += ' / ';
                }
                ligne += `$${Number(item.prix_unitaire_usd || 0).toFixed(2)}`;
            }

            lines.push(ligne);
        });

        lines.push('-'.repeat(width));
        lines.push('');

        // Totaux
        if (afficherFC) {
            lines.push(padRight('Total FC:', 50) + padLeft(`${Number(vente.montant_total_fc).toLocaleString('fr-CD')} FC`, 30));
        }
        if (afficherUSD && Number(vente.montant_total_usd || 0) > 0) {
            lines.push(padRight('Total USD:', 50) + padLeft(`$${Number(vente.montant_total_usd || 0).toFixed(2)}`, 30));
        }
        lines.push('');

        // Paiement
        if (afficherFC) {
            lines.push(padRight('Payé FC:', 50) + padLeft(`${Number(vente.montant_paye_fc).toLocaleString('fr-CD')} FC`, 30));
        }
        if (afficherUSD && Number(vente.montant_paye_usd || 0) > 0) {
            lines.push(padRight('Payé USD:', 50) + padLeft(`$${Number(vente.montant_paye_usd || 0).toFixed(2)}`, 30));
        }

        // Reste à payer
        const resteFc = Number(vente.montant_total_fc) - Number(vente.montant_paye_fc);
        if (afficherFC && resteFc > 0) {
            lines.push(padRight('Reste à payer FC:', 50) + padLeft(`${resteFc.toLocaleString('fr-CD')} FC`, 30));
        }
        const resteUsd = Number(vente.montant_total_usd || 0) - Number(vente.montant_paye_usd || 0);
        if (afficherUSD && resteUsd > 0) {
            lines.push(padRight('Reste à payer USD:', 50) + padLeft(`$${resteUsd.toFixed(2)}`, 30));
        }

        // Rendu
        if (afficherFC && Number(vente.rendu_fc || 0) > 0) {
            lines.push(padRight('Rendu FC:', 50) + padLeft(`${Number(vente.rendu_fc).toLocaleString('fr-CD')} FC`, 30));
        }
        if (afficherUSD && Number(vente.rendu_usd || 0) > 0) {
            lines.push(padRight('Rendu USD:', 50) + padLeft(`$${Number(vente.rendu_usd).toFixed(2)}`, 30));
        }
        lines.push('');

        // Message personnalisé
        const messageFacture = printer?.message_facture || 'Merci de votre visite !';
        lines.push(centerText(messageFacture, width));
        lines.push('');

        return lines.join('\n');
    };

    const centerText = (text: string, width: number): string => {
        const padding = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(padding) + text;
    };

    const padRight = (text: string, width: number): string => {
        return text.substring(0, width).padEnd(width);
    };

    const padLeft = (text: string, width: number): string => {
        return text.substring(0, width).padStart(width);
    };

    const printViaBluetooth = async () => {
        if (!printer?.adresse) {
            throw new Error('Adresse Bluetooth non configurée');
        }

        try {
            // Web Bluetooth API pour Android
            if ('bluetooth' in navigator) {
                const device = await (navigator as any).bluetooth.requestDevice({
                    filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }],
                    optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
                });

                const server = await device.gatt?.connect();
                const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
                const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

                const receipt = formatReceipt();
                const encoder = new TextEncoder();
                const data = encoder.encode(receipt);

                await characteristic?.writeValue(data);
                onPrint?.();
            } else {
                throw new Error('Bluetooth non disponible dans ce navigateur');
            }
        } catch (error) {
            onError?.(error as Error);
            throw error;
        }
    };

    const printViaUSB = async () => {
        if (!printer?.adresse) {
            throw new Error('Adresse USB non configurée');
        }

        try {
            // WebUSB API pour Android
            if ('usb' in navigator) {
                const device = await (navigator as any).usb.requestDevice({
                    filters: [{ vendorId: 0x04e8 }], // Samsung par exemple
                });

                await device.open();
                await device.selectConfiguration(1);
                await device.claimInterface(0);

                const receipt = formatReceipt();
                const encoder = new TextEncoder();
                const data = encoder.encode(receipt);

                await device.transferOut(1, data);
                onPrint?.();
            } else {
                throw new Error('USB non disponible dans ce navigateur');
            }
        } catch (error) {
            onError?.(error as Error);
            throw error;
        }
    };

    const printViaNetwork = async () => {
        if (!printer?.adresse) {
            throw new Error('Adresse réseau non configurée');
        }

        try {
            const receipt = formatReceipt();
            const response = await fetch(`http://${printer.adresse}/print`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                },
                body: receipt,
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'impression');
            }

            onPrint?.();
        } catch (error) {
            onError?.(error as Error);
            throw error;
        }
    };

    const printViaBrowser = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Impossible d\'ouvrir la fenêtre d\'impression. Vérifiez les bloqueurs de popup.');
        }

        const receipt = formatReceipt();
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Facture ${vente.numero_facture}</title>
                <style>
                    @media print {
                        @page {
                            size: 80mm auto;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 10px;
                            font-family: 'Courier New', monospace;
                            font-size: 12px;
                            line-height: 1.4;
                        }
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        white-space: pre-wrap;
                        padding: 10px;
                    }
                </style>
            </head>
            <body>${receipt.replace(/\n/g, '<br>')}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    const printViaServer = async () => {
        try {
            const response = await fetch(venteRoutes.printReceipt(vente.id).url);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de la facture');
            }
            const data = await response.json();
            return data.receipt;
        } catch (error) {
            console.error('Erreur lors de la récupération de la facture:', error);
            throw error;
        }
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        setError(null);

        try {
            // Si aucune imprimante configurée, utiliser l'impression navigateur
            if (!printer) {
                printViaBrowser();
                onPrint?.();
                return;
            }

            // Essayer d'imprimer selon le type d'imprimante
            try {
                switch (printer.type) {
                    case 'bluetooth':
                        await printViaBluetooth();
                        break;
                    case 'usb':
                        await printViaUSB();
                        break;
                    case 'wifi':
                        await printViaNetwork();
                        break;
                    default:
                        // Fallback vers impression navigateur
                        printViaBrowser();
                }
                onPrint?.();
            } catch (deviceError) {
                console.warn('Erreur impression directe, fallback vers impression navigateur:', deviceError);
                // Fallback vers impression navigateur en cas d'erreur
                printViaBrowser();
                onPrint?.();
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'impression';
            console.error('Erreur d\'impression:', error);
            setError(errorMessage);
            onError?.(error instanceof Error ? error : new Error(errorMessage));
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPrinting ? 'Impression en cours...' : 'Imprimer la facture'}
            </button>
            {error && (
                <div className="rounded-lg border border-red-500 bg-red-50 p-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-400">
                    {error}
                </div>
            )}
            {!printer && (
                <p className="text-xs text-muted-foreground">
                    Aucune imprimante configurée. L'impression utilisera l'imprimante par défaut du navigateur.
                </p>
            )}
        </div>
    );
}

