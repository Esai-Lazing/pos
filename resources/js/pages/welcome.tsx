import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { ShoppingCart, Package, BarChart3, Printer, DollarSign, TrendingUp } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const { trans } = useTranslation();

    return (
        <>
            <Head title={trans.common('welcome')}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                {trans.common('dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    {trans.auth('login')}
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        {trans.auth('register')}
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-1 font-medium text-lg lg:text-xl">
                                {trans.common('welcome')} à Pay way
                            </h1>
                            <p className="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
                                Système de point de vente moderne pour restaurants et bars congolais.
                                <br />
                                Gestion complète des ventes, du stock et des rapports.
                            </p>
                            <ul className="mb-4 flex flex-col lg:mb-6">
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-1/2 before:bottom-0 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <ShoppingCart className="h-2 w-2 text-[#dbdbd7] dark:text-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span>
                                        Gestion des ventes en temps réel avec support multi-devises (FC/USD)
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <Package className="h-2 w-2 text-[#dbdbd7] dark:text-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span>
                                        Suivi du stock avec alertes automatiques et historique des mouvements
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <BarChart3 className="h-2 w-2 text-[#dbdbd7] dark:text-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span>
                                        Rapports détaillés journaliers, hebdomadaires et mensuels
                                    </span>
                                </li>
                                <li className="relative flex items-center gap-4 py-2 before:absolute before:top-0 before:bottom-1/2 before:left-[0.4rem] before:border-l before:border-[#e3e3e0] dark:before:border-[#3E3E3A]">
                                    <span className="relative bg-white py-1 dark:bg-[#161615]">
                                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-[#e3e3e0] bg-[#FDFDFC] shadow-[0px_0px_1px_0px_rgba(0,0,0,0.03),0px_1px_2px_0px_rgba(0,0,0,0.06)] dark:border-[#3E3E3A] dark:bg-[#161615]">
                                            <Printer className="h-2 w-2 text-[#dbdbd7] dark:text-[#3E3E3A]" />
                                        </span>
                                    </span>
                                    <span>
                                        Impression automatique des factures sur imprimantes POS
                                    </span>
                                </li>
                            </ul>
                            <ul className="flex gap-3 text-sm leading-normal">
                                <li>
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-1.5 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                        >
                                            Accéder au Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            href={login()}
                                        className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-1.5 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                    >
                                            {trans.auth('login')}
                                        </Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-gradient-to-br from-[#fff2f2] to-[#ffe8e8] lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:from-[#1D0002] dark:to-[#2D0005]">
                            {/* SVG Principal - Logo POS stylisé */}
                            <svg
                                className="w-full max-w-none translate-y-0 text-[#F53003] opacity-100 transition-all duration-750 dark:text-[#F61500] starting:translate-y-6 starting:opacity-0"
                                viewBox="0 0 438 250"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Texte Pay way - Style moderne */}
                                <g transform="translate(30, 30)">
                                    <text
                                        x="0"
                                        y="0"
                                        fontSize="56"
                                        fontWeight="700"
                                        fill="currentColor"
                                        fontFamily="system-ui, sans-serif"
                                        letterSpacing="-0.5"
                                    >
                                        Pay way
                                    </text>
                                </g>
                                
                                {/* Terminal de caisse moderne */}
                                <g transform="translate(200, 20)" className="translate-y-0 opacity-100 transition-all delay-200 duration-750 starting:translate-y-4 starting:opacity-0">
                                    {/* Base du terminal */}
                                    <rect
                                        x="0"
                                        y="0"
                                        width="200"
                                        height="160"
                                        rx="12"
                                        fill="currentColor"
                                        opacity="0.08"
                                    />
                                    
                                    {/* Écran */}
                                    <rect
                                        x="15"
                                        y="15"
                                        width="170"
                                        height="110"
                                        rx="6"
                                        fill="white"
                                        className="dark:fill-[#1B1B18]"
                                    />
                                    
                                    {/* Contenu de l'écran */}
                                    <g transform="translate(25, 25)">
                                        {/* Ligne de titre */}
                                        <rect x="0" y="0" width="150" height="8" rx="2" fill="currentColor" opacity="0.4" />
                                        
                                        {/* Lignes de texte */}
                                        <rect x="0" y="20" width="120" height="6" rx="2" fill="currentColor" opacity="0.2" />
                                        <rect x="0" y="35" width="140" height="6" rx="2" fill="currentColor" opacity="0.2" />
                                        <rect x="0" y="50" width="100" height="6" rx="2" fill="currentColor" opacity="0.2" />
                                        
                                        {/* Ligne de total */}
                                        <rect x="0" y="70" width="160" height="8" rx="2" fill="currentColor" opacity="0.3" />
                                    </g>
                                    
                                    {/* Boutons tactiles */}
                                    <g transform="translate(30, 140)">
                                        <circle cx="0" cy="0" r="10" fill="currentColor" opacity="0.15" />
                                        <circle cx="35" cy="0" r="10" fill="currentColor" opacity="0.15" />
                                        <circle cx="70" cy="0" r="10" fill="currentColor" opacity="0.15" />
                                        <circle cx="105" cy="0" r="10" fill="currentColor" opacity="0.2" />
                                    </g>
                                </g>
                                
                                {/* Produits stylisés */}
                                <g transform="translate(50, 180)" opacity="0.7" className="translate-y-0 opacity-70 transition-all delay-400 duration-750 starting:translate-y-4 starting:opacity-0">
                                    {/* Bouteille */}
                                    <rect x="0" y="0" width="24" height="36" rx="3" fill="currentColor" />
                                    <rect x="6" y="6" width="12" height="24" fill="white" opacity="0.4" />
                                    
                                    {/* Casier avec bouteilles */}
                                    <g transform="translate(35, 8)">
                                        <rect x="0" y="0" width="50" height="28" rx="3" fill="currentColor" opacity="0.5" />
                                        {/* Séparateurs */}
                                        <line x1="25" y1="0" x2="25" y2="28" stroke="white" strokeWidth="1.5" opacity="0.6" />
                                        <line x1="0" y1="14" x2="50" y2="14" stroke="white" strokeWidth="1.5" opacity="0.6" />
                                        {/* Bouteilles dans le casier */}
                                        <circle cx="12" cy="7" r="4" fill="white" opacity="0.5" />
                                        <circle cx="37" cy="7" r="4" fill="white" opacity="0.5" />
                                        <circle cx="12" cy="21" r="4" fill="white" opacity="0.5" />
                                        <circle cx="37" cy="21" r="4" fill="white" opacity="0.5" />
                                    </g>
                                </g>
                                
                                {/* Graphique de croissance */}
                                <g transform="translate(320, 140)" opacity="0.6" className="translate-y-0 opacity-60 transition-all delay-300 duration-750 starting:translate-y-4 starting:opacity-0">
                                    <polyline
                                        points="0,50 15,40 30,30 45,20 60,15 75,10"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <circle cx="0" cy="50" r="4" fill="currentColor" />
                                    <circle cx="75" cy="10" r="5" fill="currentColor" />
                                    {/* Points intermédiaires */}
                                    <circle cx="15" cy="40" r="2" fill="currentColor" opacity="0.6" />
                                    <circle cx="30" cy="30" r="2" fill="currentColor" opacity="0.6" />
                                    <circle cx="45" cy="20" r="2" fill="currentColor" opacity="0.6" />
                                    <circle cx="60" cy="15" r="2" fill="currentColor" opacity="0.6" />
                                </g>
                            </svg>
                            
                            {/* SVG décoratif avec éléments POS */}
                            <svg
                                className="relative -mt-[2rem] -ml-8 w-[448px] max-w-none lg:-mt-[4rem] lg:ml-0 dark:hidden"
                                viewBox="0 0 440 300"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g className="translate-y-0 opacity-100 transition-all delay-300 duration-750 starting:translate-y-4 starting:opacity-0">
                                    {/* Facture flottante */}
                                    <rect
                                        x="100"
                                        y="50"
                                        width="200"
                                        height="150"
                                        rx="4"
                                        fill="white"
                                        stroke="#1B1B18"
                                        strokeWidth="2"
                                        opacity="0.9"
                                    />
                                    <line x1="120" y1="80" x2="280" y2="80" stroke="#1B1B18" strokeWidth="1" opacity="0.3" />
                                    <line x1="120" y1="110" x2="250" y2="110" stroke="#1B1B18" strokeWidth="1" opacity="0.2" />
                                    <line x1="120" y1="140" x2="260" y2="140" stroke="#1B1B18" strokeWidth="1" opacity="0.2" />
                                    <line x1="120" y1="170" x2="240" y2="170" stroke="#1B1B18" strokeWidth="1" opacity="0.2" />
                                    
                                    {/* Icônes de produits */}
                                    <g transform="translate(150, 220)">
                                        <rect x="0" y="0" width="30" height="40" rx="2" fill="#F8B803" opacity="0.8" />
                                        <rect x="40" y="5" width="30" height="35" rx="2" fill="#F53003" opacity="0.8" />
                                        <rect x="80" y="10" width="30" height="30" rx="2" fill="#F8B803" opacity="0.8" />
                                    </g>
                                    
                                    {/* Graphique de ventes */}
                                    <g transform="translate(50, 100)">
                                        <rect x="0" y="0" width="60" height="40" rx="2" fill="#F53003" opacity="0.2" />
                                        <rect x="0" y="20" width="60" height="20" fill="#F53003" opacity="0.4" />
                                    </g>
                                </g>
                            </svg>
                            
                            {/* Version dark mode */}
                            <svg
                                className="relative -mt-[2rem] -ml-8 hidden w-[448px] max-w-none lg:-mt-[4rem] lg:ml-0 dark:block"
                                viewBox="0 0 440 300"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g className="translate-y-0 opacity-100 transition-all delay-300 duration-750 starting:translate-y-4 starting:opacity-0">
                                    {/* Facture flottante */}
                                    <rect
                                        x="100"
                                        y="50"
                                        width="200"
                                        height="150"
                                        rx="4"
                                        fill="#1B1B18"
                                        stroke="#FF750F"
                                        strokeWidth="2"
                                        opacity="0.9"
                                    />
                                    <line x1="120" y1="80" x2="280" y2="80" stroke="#FF750F" strokeWidth="1" opacity="0.3" />
                                    <line x1="120" y1="110" x2="250" y2="110" stroke="#FF750F" strokeWidth="1" opacity="0.2" />
                                    <line x1="120" y1="140" x2="260" y2="140" stroke="#FF750F" strokeWidth="1" opacity="0.2" />
                                    <line x1="120" y1="170" x2="240" y2="170" stroke="#FF750F" strokeWidth="1" opacity="0.2" />
                                    
                                    {/* Icônes de produits */}
                                    <g transform="translate(150, 220)">
                                        <rect x="0" y="0" width="30" height="40" rx="2" fill="#FF750F" opacity="0.8" />
                                        <rect x="40" y="5" width="30" height="35" rx="2" fill="#F61500" opacity="0.8" />
                                        <rect x="80" y="10" width="30" height="30" rx="2" fill="#FF750F" opacity="0.8" />
                                    </g>
                                    
                                    {/* Graphique de ventes */}
                                    <g transform="translate(50, 100)">
                                        <rect x="0" y="0" width="60" height="40" rx="2" fill="#F61500" opacity="0.2" />
                                        <rect x="0" y="20" width="60" height="20" fill="#F61500" opacity="0.4" />
                                    </g>
                                </g>
                            </svg>
                            
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
