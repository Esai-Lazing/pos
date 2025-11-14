import AppLayout from '@/layouts/app-layout';
import * as venteRoutes from '@/routes/vente';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ReceiptPrinter } from '@/components/pos/ReceiptPrinter';
import { type Vente as VenteType } from '@/types/vente';
import { type Printer } from '@/types/printer';
import { type RestaurantCustomization } from '@/types/restaurant-customization';
import { Edit } from 'lucide-react';

interface Props {
    vente: VenteType;
    printer?: Printer | null;
    customization?: RestaurantCustomization | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vente',
        href: venteRoutes.index().url,
    },
    {
        title: 'Détails',
        href: '#',
    },
];

export default function VenteShow({ vente, printer, customization }: Props) {
    const modePaiement = vente.mode_paiement || 'fc';
    const afficherFC = modePaiement === 'fc' || modePaiement === 'mixte';
    const afficherUSD = modePaiement === 'usd' || modePaiement === 'mixte';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Facture ${vente.numero_facture}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Facture {vente.numero_facture}</h1>
                    <div className="flex gap-2">
                        <Link
                            href={venteRoutes.edit({ vente: vente.id }).url}
                            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            <Edit className="h-4 w-4" />
                            Modifier
                        </Link>
                        <Link
                            href={venteRoutes.index().url}
                            className="rounded-lg border border-border bg-background px-4 py-2 hover:bg-accent"
                        >
                            Retour
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-4 font-semibold">Articles</h2>
                        <div className="space-y-2">
                            {vente.items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <div className="font-medium">{item.produit?.nom}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {item.quantite} {item.unite}(s) ×{' '}
                                            {afficherFC && (
                                                <>{Number(item.prix_unitaire_fc).toLocaleString('fr-CD')} FC</>
                                            )}
                                            {afficherFC && afficherUSD && ' / '}
                                            {afficherUSD && (
                                                <>${Number(item.prix_unitaire_usd).toFixed(2)}</>
                                            )}
                                        </div>
                                    </div>
                                    <div className="font-semibold">
                                        {afficherFC && (
                                            <>{(Number(item.prix_unitaire_fc) * item.quantite).toLocaleString('fr-CD')} FC</>
                                        )}
                                        {afficherFC && afficherUSD && ' / '}
                                        {afficherUSD && (
                                            <>${(Number(item.prix_unitaire_usd) * item.quantite).toFixed(2)}</>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2 border-t pt-4">
                            {afficherFC && (
                                <>
                                    <div className="flex justify-between">
                                        <span>Total FC:</span>
                                        <span className="font-semibold">
                                            {Number(vente.montant_total_fc).toLocaleString('fr-CD')} FC
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payé FC:</span>
                                        <span>{Number(vente.montant_paye_fc).toLocaleString('fr-CD')} FC</span>
                                    </div>
                                    {(() => {
                                        const resteFc = Number(vente.montant_total_fc) - Number(vente.montant_paye_fc);
                                        return resteFc > 0 && (
                                            <div className="flex justify-between text-orange-600">
                                                <span>Reste à payer FC:</span>
                                                <span className="font-semibold">{resteFc.toLocaleString('fr-CD')} FC</span>
                                            </div>
                                        );
                                    })()}
                                    {Number(vente.rendu_fc) > 0 && (
                                        <div className="flex justify-between text-green-600 mt-2">
                                            <span>Rendu FC:</span>
                                            <span className="font-semibold">{Number(vente.rendu_fc).toLocaleString('fr-CD')} FC</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {afficherUSD && (
                                <>
                                    {afficherFC && <div className="mt-2" />}
                                    <div className="flex justify-between">
                                        <span>Total USD:</span>
                                        <span className="font-semibold">${Number(vente.montant_total_usd).toFixed(2)}</span>
                                    </div>
                                    {Number(vente.montant_paye_usd) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Payé USD:</span>
                                            <span>${Number(vente.montant_paye_usd).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {(() => {
                                        const resteUsd = Number(vente.montant_total_usd) - Number(vente.montant_paye_usd || 0);
                                        return resteUsd > 0 && (
                                            <div className="flex justify-between text-orange-600">
                                                <span>Reste à payer USD:</span>
                                                <span className="font-semibold">${resteUsd.toFixed(2)}</span>
                                            </div>
                                        );
                                    })()}
                                    {Number(vente.rendu_usd) > 0 && (
                                        <div className="flex justify-between text-green-600 mt-2">
                                            <span>Rendu USD:</span>
                                            <span className="font-semibold">${Number(vente.rendu_usd).toFixed(2)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="rounded-lg border border-border bg-card p-4">
                            <h3 className="mb-4 font-semibold">Actions</h3>
                            <ReceiptPrinter
                                vente={vente}
                                printer={printer || null}
                                customization={customization || null}
                                onPrint={() => {
                                    // Recharger la page pour mettre à jour le statut d'impression
                                    router.reload({ only: ['vente'] });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

